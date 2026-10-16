import { canonicalizeRrule } from './recurrence'

const EVENT_TYPES = new Set(['event', 'birthday', 'meeting'])
const HEX_COLOR = /^#[0-9a-fA-F]{6}$/

export function validateEventInput(input, base = null) {
  const data = input ?? {}
  const event = {
    title: read(data, base, 'title'),
    description: optionalText(read(data, base, 'description')),
    type: read(data, base, 'type') ?? 'event',
    startAt: read(data, base, 'startAt'),
    endAt: read(data, base, 'endAt'),
    allDay: read(data, base, 'allDay') ?? false,
    color: optionalText(read(data, base, 'color')),
    location: optionalText(read(data, base, 'location')),
    exdates: base?.exdates ?? [],
  }

  event.title = optionalText(event.title)
  if (!event.title) return invalid('Escribí un título para el evento.')
  if (!EVENT_TYPES.has(event.type)) return invalid('El tipo de evento no es válido.')
  if (!isIsoDate(event.startAt) || !isIsoDate(event.endAt)) return invalid('La fecha del evento no es válida.')
  if (new Date(event.endAt) < new Date(event.startAt)) return invalid('La fecha de fin no puede ser anterior al inicio.')
  if (typeof event.allDay !== 'boolean') return invalid('La opción de día completo no es válida.')
  if (event.color && !HEX_COLOR.test(event.color)) return invalid('El color del evento no es válido.')

  try {
    event.rrule = canonicalizeRrule(read(data, base, 'rrule'), event.startAt)
  } catch (error) {
    return invalid(error instanceof Error ? error.message : 'La repetición no es válida.')
  }

  return { ok: true, event }
}

export function isDateOnly(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value ?? '')) return false
  return new Date(`${value}T00:00:00.000Z`).toISOString().slice(0, 10) === value
}

function read(data, base, key) {
  return Object.hasOwn(data, key) ? data[key] : base?.[key]
}

function optionalText(value) {
  if (value === null || value === undefined) return null
  const normalized = String(value).trim()
  return normalized || null
}

function isIsoDate(value) {
  return typeof value === 'string' && !Number.isNaN(new Date(value).getTime())
}

function invalid(error) {
  return { ok: false, error }
}
