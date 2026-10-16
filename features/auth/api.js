import { createClient } from '@/lib/supabase/server'

export async function getCurrentUser() {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.getUser()

  if (error) {
    throw new Error('No se pudo verificar la sesión.')
  }

  return data.user
}
