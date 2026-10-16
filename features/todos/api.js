import { createClient } from '@/lib/supabase/server'
import { CATEGORY_COLUMNS, TODO_COLUMNS, toCategory, toTodo } from './todoData'

export async function getTodos() {
  const supabase = await createClient()
  await requireUser(supabase)

  const { data, error } = await supabase
    .from('todos')
    .select(TODO_COLUMNS)
    .order('created_at', { ascending: false })

  if (error) throw new Error('No se pudieron cargar los pendientes.')
  return data.map(toTodo)
}

export async function getCategories() {
  const supabase = await createClient()
  await requireUser(supabase)

  const { data, error } = await supabase
    .from('todo_categories')
    .select(CATEGORY_COLUMNS)
    .order('name', { ascending: true })

  if (error) throw new Error('No se pudieron cargar las categorías.')
  return data.map(toCategory)
}

async function requireUser(supabase) {
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) throw new Error('Necesitás iniciar sesión.')
  return user
}
