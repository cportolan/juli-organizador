import { createClient } from '@/lib/supabase/server'

const SETTINGS_COLUMNS = 'id, primary_color, theme_mode, heading_font, body_font, people_lock_enabled, created_at, updated_at'

function toSettings(row) {
  return {
    id: row.id,
    primaryColor: row.primary_color,
    themeMode: row.theme_mode,
    headingFont: row.heading_font,
    bodyFont: row.body_font,
    peopleLockEnabled: row.people_lock_enabled,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export async function getSettings() {
  const supabase = await createClient()
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) throw new Error('Necesitás iniciar sesión.')

  const { data, error } = await supabase.from('settings').select(SETTINGS_COLUMNS).eq('user_id', user.id).maybeSingle()
  if (error) throw new Error('No se pudo cargar la configuración.')
  if (!data) {
    const { data: created, error: createError } = await supabase.from('settings').insert({ user_id: user.id }).select(SETTINGS_COLUMNS).single()
    if (createError) throw new Error('No se pudo crear la configuración.')
    return toSettings(created)
  }

  return toSettings(data)
}
