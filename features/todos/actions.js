'use server'

import { actionError, actionSuccess } from '@/lib/server/actionResult'
import { getActionContext } from '@/lib/server/actionContext'
import {
  CATEGORY_COLUMNS,
  TODO_COLUMNS,
  toCategory,
  toTodo,
} from './todoData'
import { TODO_STATUSES, validateCategoryInput, validateTodoInput } from './todoValidation'

export async function createTodo(data) {
  const context = await getActionContext()
  if (!context.ok) return context.result
  const validation = await validateTodoInput(context.supabase, data)
  if (!validation.ok) return validation.result

  const row = validation.row
  const { data: created, error } = await context.supabase
    .from('todos')
    .insert({ user_id: context.user.id, ...row })
    .select(TODO_COLUMNS)
    .single()

  if (error) return actionError('No se pudo crear el pendiente.')
  return actionSuccess(toTodo(created))
}

export async function updateTodo({ id, data } = {}) {
  if (!id) return actionError('Falta identificar el pendiente.')
  const context = await getActionContext()
  if (!context.ok) return context.result
  const validation = await validateTodoInput(context.supabase, data, { partial: true })
  if (!validation.ok) return validation.result
  if (!Object.keys(validation.row).length) return actionError('No hay cambios para guardar.')

  const { data: updated, error } = await context.supabase
    .from('todos')
    .update(validation.row)
    .eq('id', id)
    .select(TODO_COLUMNS)
    .maybeSingle()

  if (error) return actionError('No se pudo actualizar el pendiente.')
  if (!updated) return actionError('No se encontró el pendiente.')
  return actionSuccess(toTodo(updated))
}

export async function deleteTodo(id) {
  return deleteOwnedRow('todos', id, 'pendiente')
}

export async function setTodoStatus({ id, status } = {}) {
  if (!id) return actionError('Falta identificar el pendiente.')
  if (!TODO_STATUSES.has(status)) return actionError('El estado no es válido.')
  const context = await getActionContext()
  if (!context.ok) return context.result

  const { data: updated, error } = await context.supabase
    .from('todos')
    .update({ status, done_at: status === 'done' ? new Date().toISOString() : null })
    .eq('id', id)
    .select(TODO_COLUMNS)
    .maybeSingle()

  if (error) return actionError('No se pudo cambiar el estado del pendiente.')
  if (!updated) return actionError('No se encontró el pendiente.')
  return actionSuccess(toTodo(updated))
}

export async function createCategory(data) {
  const context = await getActionContext()
  if (!context.ok) return context.result
  const validation = validateCategoryInput(data)
  if (!validation.ok) return validation.result

  const { data: created, error } = await context.supabase
    .from('todo_categories')
    .insert({ user_id: context.user.id, ...validation.row })
    .select(CATEGORY_COLUMNS)
    .single()

  if (error?.code === '23505') return actionError('Ya existe una categoría con ese nombre.')
  if (error) return actionError('No se pudo crear la categoría.')
  return actionSuccess(toCategory(created))
}

export async function updateCategory({ id, data } = {}) {
  if (!id) return actionError('Falta identificar la categoría.')
  const context = await getActionContext()
  if (!context.ok) return context.result
  const validation = validateCategoryInput(data, { partial: true })
  if (!validation.ok) return validation.result
  if (!Object.keys(validation.row).length) return actionError('No hay cambios para guardar.')

  const { data: updated, error } = await context.supabase
    .from('todo_categories')
    .update(validation.row)
    .eq('id', id)
    .select(CATEGORY_COLUMNS)
    .maybeSingle()

  if (error?.code === '23505') return actionError('Ya existe una categoría con ese nombre.')
  if (error) return actionError('No se pudo actualizar la categoría.')
  if (!updated) return actionError('No se encontró la categoría.')
  return actionSuccess(toCategory(updated))
}

export async function deleteCategory(id) {
  return deleteOwnedRow('todo_categories', id, 'categoría')
}

async function deleteOwnedRow(table, id, label) {
  if (!id) return actionError(`Falta identificar ${label === 'categoría' ? 'la' : 'el'} ${label}.`)
  const context = await getActionContext()
  if (!context.ok) return context.result

  const { data: deleted, error } = await context.supabase
    .from(table)
    .delete()
    .eq('id', id)
    .select('id')
    .maybeSingle()

  if (error) return actionError(`No se pudo borrar ${label === 'categoría' ? 'la' : 'el'} ${label}.`)
  if (!deleted) return actionError(`No se encontró ${label === 'categoría' ? 'la' : 'el'} ${label}.`)
  return actionSuccess(deleted)
}
