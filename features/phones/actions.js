'use server'

import { actionError, actionSuccess } from '@/lib/server/actionResult'
import { getActionContext } from '@/lib/server/actionContext'
import { PHONE_COLUMNS, toPhone, toPhoneRow } from './phoneData'

export async function createPhone(data) {
  const context = await getActionContext()
  if (!context.ok) return context.result

  const { data: created, error } = await context.supabase
    .from('phones')
    .insert({ user_id: context.user.id, ...toPhoneRow(data) })
    .select(PHONE_COLUMNS)
    .single()

  if (error) return actionError('No se pudo crear el teléfono.')
  return actionSuccess(toPhone(created))
}

export async function updatePhone({ id, data } = {}) {
  if (!id) return actionError('Falta identificar el teléfono.')
  const context = await getActionContext()
  if (!context.ok) return context.result

  const { data: updated, error } = await context.supabase
    .from('phones')
    .update(toPhoneRow(data))
    .eq('id', id)
    .select(PHONE_COLUMNS)
    .maybeSingle()

  if (error) return actionError('No se pudo actualizar el teléfono.')
  if (!updated) return actionError('No se encontró el teléfono.')
  return actionSuccess(toPhone(updated))
}

export async function deletePhone(id) {
  if (!id) return actionError('Falta identificar el teléfono.')
  const context = await getActionContext()
  if (!context.ok) return context.result

  const { data: deleted, error } = await context.supabase
    .from('phones')
    .delete()
    .eq('id', id)
    .select('id')
    .maybeSingle()

  if (error) return actionError('No se pudo borrar el teléfono.')
  if (!deleted) return actionError('No se encontró el teléfono.')
  return actionSuccess(deleted)
}
