import { actionError } from '@/lib/server/actionResult'
import { normalizeOptionalText } from './todoData'

export const TODO_STATUSES = new Set(['pending', 'done'])
const PRIORITIES = new Set(['low', 'medium', 'high'])

export async function validateTodoInput(supabase, input, { partial = false } = {}) {
  const data = input ?? {}
  const row = {}

  if (!partial || Object.hasOwn(data, 'title')) {
    const title = normalizeOptionalText(data.title)
    if (!title) return invalid('Escribí un título.')
    row.title = title
  }
  if (Object.hasOwn(data, 'description')) row.description = normalizeOptionalText(data.description)
  if (Object.hasOwn(data, 'priority')) {
    if (data.priority !== null && !PRIORITIES.has(data.priority)) return invalid('La prioridad no es válida.')
    row.priority = data.priority
  }
  if (!partial || Object.hasOwn(data, 'status')) {
    const status = data.status ?? 'pending'
    if (!TODO_STATUSES.has(status)) return invalid('El estado no es válido.')
    row.status = status
    row.done_at = status === 'done' ? new Date().toISOString() : null
  }
  if (Object.hasOwn(data, 'categoryId')) {
    if (data.categoryId !== null) {
      const { data: category, error } = await supabase
        .from('todo_categories')
        .select('id')
        .eq('id', data.categoryId)
        .maybeSingle()
      if (error) return invalid('No se pudo verificar la categoría.')
      if (!category) return invalid('La categoría no existe.')
    }
    row.category_id = data.categoryId
  }

  return { ok: true, row }
}

export function validateCategoryInput(input, { partial = false } = {}) {
  const data = input ?? {}
  const row = {}

  if (!partial || Object.hasOwn(data, 'name')) {
    const name = normalizeOptionalText(data.name)
    if (!name) return invalid('Escribí un nombre para la categoría.')
    row.name = name
  }
  if (!partial || Object.hasOwn(data, 'color')) {
    const color = data.color ?? '#c98f9b'
    if (!/^#[0-9a-f]{6}$/i.test(color)) return invalid('El color no es válido.')
    row.color = color
  }

  return { ok: true, row }
}

function invalid(message) {
  return { ok: false, result: actionError(message) }
}
