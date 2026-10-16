'use server'

import { getActionContext } from '@/lib/server/actionContext'
import { actionError, actionSuccess } from '@/lib/server/actionResult'
import { EVENT_COLUMNS, toEventRow, toPublicEvent, toStoredEvent } from './eventData'
import {
  deleteFollowing,
  deleteOneOccurrence,
  deleteWholeSeries,
  fetchEvent,
  fetchRootEvent,
  publicMutationEvent,
  updateFollowing,
  updateOneOccurrence,
  updateWholeSeries,
} from './eventMutations'
import { isDateOnly, validateEventInput } from './eventValidation'

const SCOPES = new Set(['this', 'following', 'all'])

export async function createEvent(data) {
  const context = await getActionContext()
  if (!context.ok) return context.result
  const validation = validateEventInput(data)
  if (!validation.ok) return actionError(validation.error)

  const { data: created, error } = await context.supabase
    .from('events')
    .insert({
      user_id: context.user.id,
      ...toEventRow(validation.event),
      series_id: null,
      recurrence_id: null,
    })
    .select(EVENT_COLUMNS)
    .single()

  if (error) return actionError('No se pudo crear el evento.')
  return actionSuccess(toPublicEvent(toStoredEvent(created)))
}

export async function updateEvent({ id, occurrenceDate, scope, data } = {}) {
  if (!id) return actionError('Falta identificar el evento.')
  if (!SCOPES.has(scope)) return actionError('Elegí qué repeticiones querés modificar.')
  if (scope !== 'all' && !isDateOnly(occurrenceDate)) return actionError('La fecha de la repetición no es válida.')

  const context = await getActionContext()
  if (!context.ok) return context.result
  const targetResult = await fetchEvent(context.supabase, id)
  if (targetResult.error) return actionError(targetResult.error)
  const target = targetResult.event
  const rootResult = await fetchRootEvent(context.supabase, target)
  if (rootResult.error) return actionError(rootResult.error)
  const root = rootResult.event

  let result
  if (!root.rrule) {
    result = await updateWholeSeries(context.supabase, target, data)
  } else if (scope === 'all') {
    result = await updateWholeSeries(context.supabase, root, data)
  } else if (scope === 'this') {
    result = await updateOneOccurrence(
      context.supabase,
      context.user,
      root,
      target,
      target.recurrenceId ?? occurrenceDate,
      data,
    )
  } else {
    result = await updateFollowing(
      context.supabase,
      context.user,
      root,
      target.recurrenceId ?? occurrenceDate,
      data,
    )
  }

  if (result.error) return actionError(result.error)
  return actionSuccess(publicMutationEvent(result.event, result.event.recurrenceId))
}

export async function deleteEvent({ id, occurrenceDate, scope } = {}) {
  if (!id) return actionError('Falta identificar el evento.')
  if (!SCOPES.has(scope)) return actionError('Elegí qué repeticiones querés borrar.')
  if (scope !== 'all' && !isDateOnly(occurrenceDate)) return actionError('La fecha de la repetición no es válida.')

  const context = await getActionContext()
  if (!context.ok) return context.result
  const targetResult = await fetchEvent(context.supabase, id)
  if (targetResult.error) return actionError(targetResult.error)
  const target = targetResult.event
  const rootResult = await fetchRootEvent(context.supabase, target)
  if (rootResult.error) return actionError(rootResult.error)
  const root = rootResult.event

  let result
  if (!root.rrule || scope === 'all') {
    result = await deleteWholeSeries(context.supabase, root.id)
  } else if (scope === 'this') {
    result = await deleteOneOccurrence(context.supabase, root, target, target.recurrenceId ?? occurrenceDate)
  } else {
    result = await deleteFollowing(context.supabase, root, target.recurrenceId ?? occurrenceDate)
  }

  if (result.error) return actionError(result.error)
  return actionSuccess(result.data)
}

export async function saveDayNote({ date, content } = {}) {
  if (!isDateOnly(date)) return actionError('La fecha de la nota no es válida.')
  if (!isJsonObject(content)) return actionError('El contenido de la nota no es válido.')

  const context = await getActionContext()
  if (!context.ok) return context.result
  const { data, error } = await context.supabase
    .from('day_notes')
    .upsert({ user_id: context.user.id, date, content }, { onConflict: 'user_id,date' })
    .select('date, content, created_at, updated_at')
    .single()

  if (error) return actionError('No se pudo guardar la nota del día.')
  return actionSuccess({
    date: data.date,
    content: data.content,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  })
}

function isJsonObject(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false
  try {
    JSON.stringify(value)
    return true
  } catch {
    return false
  }
}
