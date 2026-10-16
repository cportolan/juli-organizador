'use server'

import { createClient } from '@/lib/supabase/server'
import { actionError, actionSuccess } from '@/lib/server/actionResult'
import bcrypt from 'bcryptjs'

const FIELD_MAP = {
  primaryColor: 'primary_color',
  themeMode: 'theme_mode',
  headingFont: 'heading_font',
  bodyFont: 'body_font',
  peopleLockEnabled: 'people_lock_enabled',
}

export async function updateSettings(partialSettings) {
  const supabase = await createClient()
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) return actionError('Necesitás iniciar sesión.')

  const update = Object.entries(partialSettings ?? {}).reduce((result, [key, value]) => {
    if (FIELD_MAP[key] && value !== undefined) result[FIELD_MAP[key]] = value
    return result
  }, {})
  if (!Object.keys(update).length) return actionError('No hay cambios para guardar.')

  const { data, error } = await supabase.from('settings').upsert({ user_id: user.id, ...update }, { onConflict: 'user_id' }).select('id, primary_color, theme_mode, heading_font, body_font, people_lock_enabled, created_at, updated_at').single()
  if (error) return actionError('No se pudo guardar la configuración.')

  return actionSuccess({
    id: data.id,
    primaryColor: data.primary_color,
    themeMode: data.theme_mode,
    headingFont: data.heading_font,
    bodyFont: data.body_font,
    peopleLockEnabled: data.people_lock_enabled,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  })
}

export async function setPeoplePassword({ currentPassword, newPassword }) {
  const supabase = await createClient()
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) return actionError('Necesitás iniciar sesión.')
  if (newPassword !== null && typeof newPassword !== 'string') return actionError('La nueva contraseña no es válida.')
  if (newPassword !== null && newPassword.length < 8) return actionError('La contraseña debe tener al menos 8 caracteres.')

  const { data: settings, error: readError } = await supabase.from('settings').select('people_password_hash').eq('user_id', user.id).maybeSingle()
  if (readError) return actionError('No se pudo verificar la contraseña de Usuarios.')
  if (settings?.people_password_hash) {
    const valid = await bcrypt.compare(currentPassword ?? '', settings.people_password_hash)
    if (!valid) return actionError('La contraseña actual no es correcta.')
  } else if (currentPassword) {
    return actionError('No hay una contraseña de Usuarios configurada.')
  }

  const passwordHash = newPassword === null ? null : await bcrypt.hash(newPassword, 12)
  const { error } = await supabase.from('settings').upsert({
    user_id: user.id,
    people_password_hash: passwordHash,
    people_lock_enabled: passwordHash !== null,
  }, { onConflict: 'user_id' })
  if (error) return actionError('No se pudo guardar la contraseña de Usuarios.')

  return actionSuccess({ peopleLockEnabled: passwordHash !== null })
}
