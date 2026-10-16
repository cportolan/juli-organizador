export const TODO_COLUMNS = 'id, title, description, priority, status, category_id, done_at, created_at, updated_at'
export const CATEGORY_COLUMNS = 'id, name, color, created_at, updated_at'

export function toTodo(row) {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    priority: row.priority,
    status: row.status,
    categoryId: row.category_id,
    doneAt: row.done_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export function toCategory(row) {
  return {
    id: row.id,
    name: row.name,
    color: row.color,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export function normalizeOptionalText(value) {
  if (value === null || value === undefined) return null
  const normalized = String(value).trim()
  return normalized || null
}
