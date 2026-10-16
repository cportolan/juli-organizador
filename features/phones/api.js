import { createClient } from '@/lib/supabase/server'
import { PHONE_COLUMNS, toPhone } from './phoneData'

export async function getPhones() {
  const supabase = await createClient()
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) throw new Error('Necesitás iniciar sesión.')

  const { data, error } = await supabase
    .from('phones')
    .select(PHONE_COLUMNS)
    .order('office', { ascending: true, nullsFirst: false })
    .order('agent', { ascending: true, nullsFirst: false })

  if (error) throw new Error('No se pudieron cargar los teléfonos.')
  return data.map(toPhone)
}
