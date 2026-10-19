import * as rruleModule from 'rrule'

// Node carga el build CommonJS de rrule (solo `default`) y el bundler de Next
// el ESM (solo exports con nombre): se toma RRule de donde esté.
const { RRule } = rruleModule.RRule ? rruleModule : rruleModule.default

const ALLOWED_FREQUENCIES = new Set([RRule.DAILY, RRule.WEEKLY, RRule.MONTHLY, RRule.YEARLY])
const CALENDAR_TIME_ZONE = 'America/Argentina/Buenos_Aires'
const zonedDateTime = new Intl.DateTimeFormat('en-CA', {
  timeZone: CALENDAR_TIME_ZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hourCycle: 'h23',
})

export function canonicalizeRrule(value, startAt) {
  if (value === null || value === undefined || value === '') return null
  const options = parseOptions(value)
  if (!ALLOWED_FREQUENCIES.has(options.freq)) throw new Error('La frecuencia de repetición no es válida.')
  if (options.interval !== undefined && (!Number.isInteger(options.interval) || options.interval < 1)) {
    throw new Error('El intervalo de repetición no es válido.')
  }
  if (options.count !== undefined && (!Number.isInteger(options.count) || options.count < 1)) {
    throw new Error('La cantidad de repeticiones no es válida.')
  }
  if (options.count !== undefined && options.until !== undefined) {
    throw new Error('Elegí una fecha de fin o una cantidad de repeticiones, no ambas.')
  }
  if (options.until && options.until < new Date(startAt)) {
    throw new Error('La fecha de fin de la repetición no es válida.')
  }
  return serializeRule({ ...options, dtstart: new Date(startAt) })
}

export function expandEvent(event, from, to, holidays = new Set()) {
  const fromDate = new Date(from)
  const toDate = new Date(to)
  const duration = new Date(event.endAt).getTime() - new Date(event.startAt).getTime()

  if (!event.rrule) {
    if (!overlaps(event.startAt, event.endAt, fromDate, toDate)) return []
    return [{ ...event, occurrenceDate: dateKey(event.startAt) }]
  }

  const rule = buildRule(event.rrule, event.startAt)
  const excluded = new Set(event.exdates)
  const padding = businessDayDirection(event.rrule) ? 32 * 86400000 : 0
  const searchFrom = new Date(fromDate.getTime() - duration - padding)
  const searchTo = new Date(toDate.getTime() + padding)

  return rule.between(toFloatingDate(searchFrom), toFloatingDate(searchTo), true)
    .map(fromFloatingDate)
    .filter((start) => !excluded.has(dateKey(start)))
    .map((nominalStart) => {
      const start = shiftBusinessDay(event, nominalStart, holidays)
      const end = new Date(start.getTime() + duration)
      return {
        ...event,
        startAt: start.toISOString(),
        endAt: end.toISOString(),
        occurrenceDate: dateKey(start),
      }
    })
    .filter((occurrence) => overlaps(occurrence.startAt, occurrence.endAt, fromDate, toDate))
}

export function businessDayDirection(value) {
  if (!value) return 0
  const options = parseOptions(value)
  const days = options.byweekday ?? []
  const positions = Array.isArray(options.bysetpos) ? options.bysetpos : [options.bysetpos]
  return options.freq === RRule.MONTHLY && positions.length === 1 &&
    [1, -1].includes(positions[0]) && days.length === 5 &&
    [0, 1, 2, 3, 4].every((day) => days.some((item) => item.weekday === day && !item.n))
    ? positions[0] : 0
}

export function shiftBusinessDay(event, start, holidays) {
  const direction = businessDayDirection(event.rrule)
  if (!direction || !holidays.has(dateKey(start))) return start
  const floating = toFloatingDate(start)
  for (let day = 0; day < 32; day += 1) {
    floating.setUTCDate(floating.getUTCDate() + direction)
    const shifted = fromFloatingDate(floating)
    if (![0, 6].includes(floating.getUTCDay()) && !holidays.has(dateKey(shifted))) return shifted
  }
  return start
}

// Resolve the displayed date back to the nominal RRULE identity, even if excluded.
export function resolveOccurrenceDate(event, occurrenceDate, holidays) {
  if (!businessDayDirection(event.rrule)) return occurrenceDate
  const center = new Date(`${occurrenceDate}T12:00:00Z`)
  const rule = buildRule(event.rrule, event.startAt)
  const candidates = rule.between(new Date(+center - 32 * 86400000), new Date(+center + 32 * 86400000), true)
  const match = candidates.map(fromFloatingDate).find((start) =>
    dateKey(shiftBusinessDay(event, start, holidays)) === occurrenceDate)
  return match ? dateKey(match) : null
}

export function findOccurrenceStart(event, occurrenceDate) {
  const rule = buildRule(event.rrule, event.startAt)
  const dayStart = new Date(`${occurrenceDate}T00:00:00.000Z`)
  const dayEnd = new Date(`${occurrenceDate}T23:59:59.999Z`)
  const occurrence = rule.between(dayStart, dayEnd, true)[0]
  return occurrence ? fromFloatingDate(occurrence) : null
}

export function splitRrule(event, occurrenceStart, nextStart) {
  const rule = buildRule(event.rrule, event.startAt)
  const original = { ...rule.origOptions, dtstart: toFloatingDate(event.startAt) }
  const floatingOccurrenceStart = toFloatingDate(occurrenceStart)
  const beforeBoundary = new Date(floatingOccurrenceStart.getTime() - 1)
  const previousCount = rule.between(original.dtstart, beforeBoundary, true).length
  const originalCount = original.count ?? null
  const remainingCount = originalCount === null ? null : originalCount - previousCount

  const beforeRrule = previousCount === 0
    ? null
    : serializeRule({ ...original, dtstart: new Date(event.startAt), count: previousCount, until: null })
  const nextOptions = {
    ...original,
    dtstart: nextStart,
    until: original.until ? fromFloatingDate(original.until) : undefined,
    count: remainingCount,
  }

  return {
    beforeRrule,
    nextRrule: serializeRule(nextOptions),
    previousCount,
  }
}

export function dateKey(value) {
  const parts = zonedParts(value)
  return `${parts.year}-${pad(parts.month)}-${pad(parts.day)}`
}

function buildRule(value, startAt) {
  const options = parseOptions(value)
  return new RRule({
    ...options,
    dtstart: toFloatingDate(startAt),
    until: options.until ? toFloatingDate(options.until) : undefined,
  })
}

function parseOptions(value) {
  const line = String(value)
    .split(/\r?\n/)
    .find((part) => part.trim().toUpperCase().startsWith('RRULE:'))
  const ruleValue = line ? line.trim().slice(6) : String(value).trim().replace(/^RRULE:/i, '')
  return RRule.parseString(ruleValue)
}

function serializeRule(options) {
  const cleaned = Object.fromEntries(Object.entries(options).filter(([, value]) => value !== null && value !== undefined))
  return new RRule(cleaned).toString()
}

function overlaps(startAt, endAt, from, to) {
  return new Date(startAt) < to && new Date(endAt) > from
}

function toFloatingDate(value) {
  const parts = zonedParts(value)
  return new Date(Date.UTC(
    parts.year,
    parts.month - 1,
    parts.day,
    parts.hour,
    parts.minute,
    parts.second,
    new Date(value).getUTCMilliseconds(),
  ))
}

function fromFloatingDate(value) {
  const floating = new Date(value)
  const expected = Date.UTC(
    floating.getUTCFullYear(),
    floating.getUTCMonth(),
    floating.getUTCDate(),
    floating.getUTCHours(),
    floating.getUTCMinutes(),
    floating.getUTCSeconds(),
    floating.getUTCMilliseconds(),
  )
  let instant = expected

  // Two passes also handle zones whose offset changes around the target date.
  for (let pass = 0; pass < 2; pass += 1) {
    const actual = zonedParts(instant)
    const represented = Date.UTC(
      actual.year,
      actual.month - 1,
      actual.day,
      actual.hour,
      actual.minute,
      actual.second,
      floating.getUTCMilliseconds(),
    )
    instant += expected - represented
  }

  return new Date(instant)
}

function zonedParts(value) {
  return Object.fromEntries(
    zonedDateTime
      .formatToParts(new Date(value))
      .filter(({ type }) => type !== 'literal')
      .map(({ type, value: part }) => [type, Number(part)]),
  )
}

function pad(value) {
  return String(value).padStart(2, '0')
}
