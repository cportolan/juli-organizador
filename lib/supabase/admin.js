import 'server-only'
import { createClient } from '@supabase/supabase-js'

// Never attach browser cookies: this client is privileged. Callers must check ownership.
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SECRET_KEY
  if (!url || !key) throw new Error('Falta configurar el acceso privado de Supabase.')
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })
}
