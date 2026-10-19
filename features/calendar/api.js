import { createClient } from '@/lib/supabase/server'
import { EVENT_COLUMNS, toPublicEvent, toStoredEvent } from './eventData'
import { getHolidaysInRange, recurrenceHolidays } from './holidays'
import { expandEvent, businessDayDirection } from './recurrence'
import { isDateOnly } from './eventValidation'

export async function getEvents({ from, to } = {}) {
  if (!isRange(from, to)) throw new Error('El rango de fechas no es válido.')

  const supabase = await createClient()
  await requireUser(supabase)
  const rangeStart = new Date(from).toISOString()
  const rangeEnd = new Date(to).toISOString()
  const { data, error } = await supabase.from('events').select(EVENT_COLUMNS)
    .or(`rrule.not.is.null,series_id.not.is.null,and(start_at.lt.${rangeEnd},end_at.gte.${rangeStart})`)
  if (error) throw new Error('No se pudieron cargar los eventos.')

  const holidays = data.some((event) => businessDayDirection(event.rrule))
    ? await recurrenceHolidays(from, to) : new Set()
  return data
    .map(toStoredEvent)
    .flatMap((event) => expandEvent(event, from, to, holidays))
    .map(toPublicEvent)
    .sort((first, second) => new Date(first.startAt) - new Date(second.startAt))
}

export async function getDayNote(date) {
  if (!isDateOnly(date)) throw new Error('La fecha de la nota no es válida.')

  const supabase = await createClient()
  await requireUser(supabase)
  const { data, error } = await supabase
    .from('day_notes')
    .select('date, content, created_at, updated_at')
    .eq('date', date)
    .maybeSingle()

  if (error) throw new Error('No se pudo cargar la nota del día.')
  if (!data) return null
  return {
    date: data.date,
    content: data.content,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  }
}

export async function getDayNotes({ from, to } = {}) {
  if (!isDateOnly(from) || !isDateOnly(to) || from > to) throw new Error('El rango de fechas no es válido.')
  const supabase = await createClient()
  await requireUser(supabase)
  const { data, error } = await supabase.from('day_notes').select('date')
    .gte('date', from).lte('date', to).order('date')
  if (error) throw new Error('No se pudieron cargar las notas del día.')
  return data
}

async function requireUser(supabase) {
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) throw new Error('Necesitás iniciar sesión.')
  return user
}

function isRange(from, to) {
  const fromTime = new Date(from ?? '').getTime()
  const toTime = new Date(to ?? '').getTime()
  return Number.isFinite(fromTime) && Number.isFinite(toTime) && fromTime < toTime
}

export async function getHolidays({ from, to } = {}) {
  if (!isDateOnly(from) || !isDateOnly(to) || from > to) throw new Error('El rango de fechas no es válido.')
  return getHolidaysInRange({ from, to })
}
