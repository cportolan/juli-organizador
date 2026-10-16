import { EVENT_COLUMNS, toEventRow, toPublicEvent, toStoredEvent } from './eventData'
import { validateEventInput } from './eventValidation'
import { findOccurrenceStart, splitRrule } from './recurrence'

export async function fetchEvent(supabase, id) {
  const { data, error } = await supabase
    .from('events')
    .select(EVENT_COLUMNS)
    .eq('id', id)
    .maybeSingle()
  if (error) return { error: 'No se pudo cargar el evento.' }
  if (!data) return { error: 'No se encontró el evento.' }
  return { event: toStoredEvent(data) }
}

export async function fetchRootEvent(supabase, event) {
  if (!event.seriesId) return { event }
  return fetchEvent(supabase, event.seriesId)
}

export async function updateWholeSeries(supabase, root, input) {
  const validation = validateEventInput(input, root)
  if (!validation.ok) return validation
  return updateEventRow(supabase, root.id, toEventRow(validation.event))
}

export async function updateOneOccurrence(supabase, user, root, target, occurrenceDate, input) {
  const existing = target.seriesId
    ? target
    : await findException(supabase, root.id, occurrenceDate)
  if (existing?.error) return existing

  if (existing?.event) {
    const validation = validateEventInput({ ...input, rrule: null }, existing.event)
    if (!validation.ok) return validation
    return updateEventRow(supabase, existing.event.id, toEventRow(validation.event))
  }

  const occurrenceStart = findOccurrenceStart(root, occurrenceDate)
  if (!occurrenceStart || root.exdates.includes(occurrenceDate)) return { error: 'No se encontró esa repetición del evento.' }
  const duration = new Date(root.endAt).getTime() - new Date(root.startAt).getTime()
  const occurrenceBase = {
    ...root,
    id: undefined,
    startAt: occurrenceStart.toISOString(),
    endAt: new Date(occurrenceStart.getTime() + duration).toISOString(),
    rrule: null,
    exdates: [],
    seriesId: root.id,
    recurrenceId: occurrenceDate,
  }
  const validation = validateEventInput({ ...input, rrule: null }, occurrenceBase)
  if (!validation.ok) return validation

  const exdateResult = await setExdates(supabase, root, [...root.exdates, occurrenceDate])
  if (exdateResult.error) return exdateResult

  const { data, error } = await supabase
    .from('events')
    .upsert({
      user_id: user.id,
      series_id: root.id,
      recurrence_id: occurrenceDate,
      ...toEventRow(validation.event),
    }, { onConflict: 'user_id,series_id,recurrence_id' })
    .select(EVENT_COLUMNS)
    .single()
  if (error) return { error: 'No se pudo actualizar esa repetición.' }
  return { event: { ...toStoredEvent(data), occurrenceDate } }
}

export async function updateFollowing(supabase, user, root, occurrenceDate, input) {
  const occurrenceStart = findOccurrenceStart(root, occurrenceDate)
  if (!occurrenceStart || root.exdates.includes(occurrenceDate)) return { error: 'No se encontró esa repetición del evento.' }
  const duration = new Date(root.endAt).getTime() - new Date(root.startAt).getTime()
  const occurrenceBase = {
    ...root,
    startAt: occurrenceStart.toISOString(),
    endAt: new Date(occurrenceStart.getTime() + duration).toISOString(),
    exdates: root.exdates.filter((date) => date >= occurrenceDate),
  }
  const validation = validateEventInput(input, occurrenceBase)
  if (!validation.ok) return validation

  const split = splitRrule(root, occurrenceStart, new Date(validation.event.startAt))
  validation.event.rrule = split.nextRrule
  const futureDelete = await deleteFutureExceptions(supabase, root.id, occurrenceDate)
  if (futureDelete.error) return futureDelete

  if (!split.beforeRrule) {
    return updateEventRow(supabase, root.id, toEventRow(validation.event))
  }

  const rootUpdate = await updateEventRow(supabase, root.id, {
    rrule: split.beforeRrule,
    exdates: root.exdates.filter((date) => date < occurrenceDate),
  })
  if (rootUpdate.error) return rootUpdate

  const { data, error } = await supabase
    .from('events')
    .insert({ user_id: user.id, ...toEventRow(validation.event), series_id: null, recurrence_id: null })
    .select(EVENT_COLUMNS)
    .single()
  if (error) return { error: 'No se pudo separar la serie desde esa fecha.' }
  return { event: toStoredEvent(data) }
}

export async function deleteOneOccurrence(supabase, root, target, occurrenceDate) {
  const date = target.recurrenceId ?? occurrenceDate
  const exdateResult = await setExdates(supabase, root, [...root.exdates, date])
  if (exdateResult.error) return exdateResult

  const { error } = await supabase
    .from('events')
    .delete()
    .eq('series_id', root.id)
    .eq('recurrence_id', date)
  if (error) return { error: 'No se pudo borrar esa repetición.' }
  return { data: { id: root.id, occurrenceDate: date } }
}

export async function deleteFollowing(supabase, root, occurrenceDate) {
  const occurrenceStart = findOccurrenceStart(root, occurrenceDate)
  if (!occurrenceStart) return { error: 'No se encontró esa repetición del evento.' }
  const split = splitRrule(root, occurrenceStart, occurrenceStart)
  if (!split.beforeRrule) return deleteWholeSeries(supabase, root.id)

  const exceptions = await deleteFutureExceptions(supabase, root.id, occurrenceDate)
  if (exceptions.error) return exceptions
  const updated = await updateEventRow(supabase, root.id, {
    rrule: split.beforeRrule,
    exdates: root.exdates.filter((date) => date < occurrenceDate),
  })
  if (updated.error) return updated
  return { data: { id: root.id, occurrenceDate } }
}

export async function deleteWholeSeries(supabase, id) {
  const { data, error } = await supabase.from('events').delete().eq('id', id).select('id').maybeSingle()
  if (error) return { error: 'No se pudo borrar el evento.' }
  if (!data) return { error: 'No se encontró el evento.' }
  return { data }
}

export function publicMutationEvent(event, occurrenceDate = null) {
  return toPublicEvent(occurrenceDate ? { ...event, occurrenceDate } : event)
}

async function updateEventRow(supabase, id, row) {
  const { data, error } = await supabase
    .from('events')
    .update(row)
    .eq('id', id)
    .select(EVENT_COLUMNS)
    .maybeSingle()
  if (error) return { error: 'No se pudo actualizar el evento.' }
  if (!data) return { error: 'No se encontró el evento.' }
  return { event: toStoredEvent(data) }
}

async function findException(supabase, seriesId, recurrenceId) {
  const { data, error } = await supabase
    .from('events')
    .select(EVENT_COLUMNS)
    .eq('series_id', seriesId)
    .eq('recurrence_id', recurrenceId)
    .maybeSingle()
  if (error) return { error: 'No se pudo cargar la excepción del evento.' }
  return { event: data ? toStoredEvent(data) : null }
}

async function setExdates(supabase, root, values) {
  const exdates = [...new Set(values)].sort()
  const { error } = await supabase.from('events').update({ exdates }).eq('id', root.id)
  return error ? { error: 'No se pudo actualizar la serie.' } : { exdates }
}

async function deleteFutureExceptions(supabase, seriesId, occurrenceDate) {
  const { error } = await supabase
    .from('events')
    .delete()
    .eq('series_id', seriesId)
    .gte('recurrence_id', occurrenceDate)
  return error ? { error: 'No se pudieron actualizar las excepciones de la serie.' } : {}
}
