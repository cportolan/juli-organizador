'use server'

import { getActionContext } from '@/lib/server/actionContext'
import { actionError, actionSuccess } from '@/lib/server/actionResult'
import { createAdminClient } from '@/lib/supabase/admin'
import { checkPassword, hashPassword } from '@/lib/server/people/access'
import { peopleAction } from '@/lib/server/people/action'

const FIELD_MAP = {
  primaryColor: 'primary_color',
  themeMode: 'theme_mode',
  headingFont: 'heading_font',
  bodyFont: 'body_font',
}

const THEME_MODES = new Set(['light', 'dark', 'system'])
const HEADING_FONTS = new Set(['lora', 'fraunces', 'playfair', 'dm-serif'])
const BODY_FONTS = new Set(['roboto', 'inter', 'nunito', 'dm-sans'])
const HEX_COLOR = /^#[0-9a-fA-F]{6}$/

export async function updateSettings(partialSettings) {
  const context = await getActionContext()
  if (!context.ok) return context.result
  const { supabase, user } = context

  const validationError = validateSettings(partialSettings)
  if (validationError) return actionError(validationError)

  const update = Object.entries(partialSettings ?? {}).reduce((result, [key, value]) => {
    if (FIELD_MAP[key] && value !== undefined) result[FIELD_MAP[key]] = value
    return result
  }, {})
  if (!Object.keys(update).length) return actionError('No hay cambios para guardar.')

  const { data: existing, error: readError } = await supabase.from('settings').select('id').eq('user_id', user.id).maybeSingle()
  if (readError) return actionError('No se pudo cargar la configuración.')
  const query = existing
    ? supabase.from('settings').update(update).eq('user_id', user.id)
    : supabase.from('settings').insert({ user_id: user.id, ...update })
  const { data, error } = await query.select('id, primary_color, theme_mode, heading_font, body_font, people_lock_enabled, created_at, updated_at').single()
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

function validateSettings(settings) {
  if (!settings || typeof settings !== 'object' || Array.isArray(settings)) {
    return 'La configuración no es válida.'
  }
  if (Object.hasOwn(settings, 'primaryColor') && (typeof settings.primaryColor !== 'string' || !HEX_COLOR.test(settings.primaryColor))) {
    return 'El color primario no es válido.'
  }
  if (Object.hasOwn(settings, 'themeMode') && !THEME_MODES.has(settings.themeMode)) {
    return 'El modo de tema no es válido.'
  }
  if (Object.hasOwn(settings, 'headingFont') && !HEADING_FONTS.has(settings.headingFont)) {
    return 'La tipografía de títulos no es válida.'
  }
  if (Object.hasOwn(settings, 'bodyFont') && !BODY_FONTS.has(settings.bodyFont)) {
    return 'La tipografía de texto no es válida.'
  }
  if (Object.hasOwn(settings, 'peopleLockEnabled')) return 'Usá la contraseña de Usuarios para cambiar el bloqueo.'
  return null
}

export async function setPeoplePassword({ currentPassword, newPassword } = {}) {
  return peopleAction(async () => {
    const context = await getActionContext()
    if (!context.ok) return context.result
    const { user } = context
    const admin = createAdminClient()
    const { data: settings, error: readError } = await admin.from('settings').select('people_password_hash').eq('user_id', user.id).maybeSingle()
    if (readError) return actionError('No se pudo verificar la contraseña de Usuarios.')
    if (settings?.people_password_hash) {
      if (!await checkPassword(currentPassword, settings.people_password_hash)) return actionError('La contraseña actual no es correcta.')
    } else if (currentPassword) {
      return actionError('No hay una contraseña de Usuarios configurada.')
    }
    const passwordHash = newPassword === null ? null : await hashPassword(newPassword)
    const { error } = await admin.from('settings').upsert({
      user_id: user.id, people_password_hash: passwordHash, people_lock_enabled: passwordHash !== null,
    }, { onConflict: 'user_id' })
    if (error) return actionError('No se pudo guardar la contraseña de Usuarios.')
    return actionSuccess({ peopleLockEnabled: passwordHash !== null })
  })
}
