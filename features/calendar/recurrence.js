import rrule from 'rrule'

const { RRule } = rrule

const ALLOWED_FREQUENCIES = new Set([RRule.DAILY, RRule.WEEKLY, RRule.MONTHLY, RRule.YEARLY])

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

export function expandEvent(event, from, to) {
  const fromDate = new Date(from)
  const toDate = new Date(to)
  const duration = new Date(event.endAt).getTime() - new Date(event.startAt).getTime()

  if (!event.rrule) {
    if (!overlaps(event.startAt, event.endAt, fromDate, toDate)) return []
    return [{ ...event, occurrenceDate: event.recurrenceId ?? dateKey(event.startAt) }]
  }

  const rule = buildRule(event.rrule, event.startAt)
  const excluded = new Set(event.exdates)
  const searchFrom = new Date(fromDate.getTime() - duration)

  return rule.between(searchFrom, toDate, true)
    .filter((start) => !excluded.has(dateKey(start)))
    .map((start) => {
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

export function findOccurrenceStart(event, occurrenceDate) {
  const rule = buildRule(event.rrule, event.startAt)
  const dayStart = new Date(`${occurrenceDate}T00:00:00.000Z`)
  const dayEnd = new Date(`${occurrenceDate}T23:59:59.999Z`)
  return rule.between(dayStart, dayEnd, true).find((date) => dateKey(date) === occurrenceDate) ?? null
}

export function splitRrule(event, occurrenceStart, nextStart) {
  const rule = buildRule(event.rrule, event.startAt)
  const original = { ...rule.origOptions, dtstart: new Date(event.startAt) }
  const beforeBoundary = new Date(occurrenceStart.getTime() - 1)
  const previousCount = rule.between(new Date(event.startAt), beforeBoundary, true).length
  const originalCount = original.count ?? null
  const remainingCount = originalCount === null ? null : originalCount - previousCount

  const beforeRrule = previousCount === 0
    ? null
    : serializeRule({ ...original, count: previousCount, until: null })
  const nextOptions = {
    ...original,
    dtstart: nextStart,
    count: remainingCount,
  }

  return {
    beforeRrule,
    nextRrule: serializeRule(nextOptions),
    previousCount,
  }
}

export function dateKey(value) {
  return new Date(value).toISOString().slice(0, 10)
}

function buildRule(value, startAt) {
  return new RRule({ ...parseOptions(value), dtstart: new Date(startAt) })
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
