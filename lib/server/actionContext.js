import { actionError } from '@/lib/server/actionResult'
import { createClient } from '@/lib/supabase/server'

export async function getActionContext() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    return { ok: false, result: actionError('Necesitás iniciar sesión.') }
  }

  return { ok: true, supabase, user }
}
