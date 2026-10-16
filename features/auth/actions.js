'use server'

import { createClient } from '@/lib/supabase/server'
import { actionError, actionSuccess } from '@/lib/server/actionResult'

export async function signIn({ email, password }) {
  if (!email || !password) {
    return actionError('Completá tu email y contraseña.')
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    return actionError('El email o la contraseña no son correctos.')
  }

  return actionSuccess(null)
}

export async function signOut() {
  const supabase = await createClient()
  const { error } = await supabase.auth.signOut()

  if (error) {
    return actionError('No se pudo cerrar la sesión.')
  }

  return actionSuccess(null)
}
