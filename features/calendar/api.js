import { createClient } from '@/lib/supabase/server'
import { EVENT_COLUMNS, toPublicEvent, toStoredEvent } from './eventData'
import { expandEvent } from './recurrence'
import { isDateOnly } from './eventValidation'

export async function getEvents({ from, to } = {}) {
  if (!isRange(from, to)) throw new Error('El rango de fechas no es válido.')

  const supabase = await createClient()
  await requireUser(supabase)
  const { data, error } = await supabase.from('events').select(EVENT_COLUMNS)
  if (error) throw new Error('No se pudieron cargar los eventos.')

  return data
    .map(toStoredEvent)
    .flatMap((event) => expandEvent(event, from, to))
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
