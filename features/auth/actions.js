'use server'

import { cookies } from 'next/headers'
import { SIGNED_OUT_COOKIE } from '@/lib/server/mobile/protocol'
import { createClient } from '@/lib/supabase/server'
import { actionError, actionSuccess } from '@/lib/server/actionResult'

export async function signIn({ email, password } = {}) {
  if (!email || !password) {
    return actionError('Completá tu email y contraseña.')
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    return actionError('El email o la contraseña no son correctos.')
  }

  const cookieStore = await cookies()
  cookieStore.delete(SIGNED_OUT_COOKIE)
  return actionSuccess(null)
}

export async function signOut() {
  const supabase = await createClient()
  const { error } = await supabase.auth.signOut()

  if (error) {
    return actionError('No se pudo cerrar la sesión.')
  }

  const cookieStore = await cookies()
  cookieStore.set(SIGNED_OUT_COOKIE, '1', { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/', maxAge: 86400 })
  return actionSuccess(null)
}
