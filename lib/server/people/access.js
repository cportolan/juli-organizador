import 'server-only'
import { cookies } from 'next/headers'
import bcrypt from 'bcryptjs'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { issueToken, verifyToken, passwordVersion, UNLOCK_SECONDS } from './tokens'

const SECTION_COOKIE = 'oj-people-unlock'
// A single active person grant matches the UI, which relocks tabs on navigation.
const PERSON_COOKIE = 'oj-person-unlock'

function secret() {
  const value = process.env.PEOPLE_COOKIE_SECRET
  if (!value || Buffer.byteLength(value) < 32) throw new Error('Falta configurar la firma privada de Usuarios.')
  return value
}

export async function peopleContext({ requireSection = true } = {}) {
  const client = await createClient()
  const { data: { user }, error } = await client.auth.getUser()
  if (error || !user) throw new Error('Necesitás iniciar sesión.')
  // getUser above validates the token; bind cookies to that login's session_id.
  const { data: { session } } = await client.auth.getSession()
  const claims = JSON.parse(Buffer.from(session?.access_token?.split('.')[1] ?? '', 'base64url').toString() || '{}')
  if (!claims.session_id) throw new Error('Necesitás iniciar sesión.')
  const admin = createAdminClient()
  const { data: settings, error: settingsError } = await admin.from('settings')
    .select('people_lock_enabled, people_password_hash').eq('user_id', user.id).maybeSingle()
  if (settingsError) throw new Error('No se pudo verificar el bloqueo de Usuarios.')
  const context = { admin, user, sessionId: claims.session_id, settings, store: await cookies() }
  if (requireSection && !sectionUnlocked(context)) throw new Error('Desbloqueá la sección Usuarios.')
  return context
}

function binding(context, person) {
  return JSON.stringify([context.user.id, context.sessionId,
    passwordVersion(context.settings?.people_password_hash),
    person?.id ?? 'section', passwordVersion(person?.password_hash)])
}

export function sectionUnlocked(context) {
  if (!context.settings?.people_password_hash) return true
  return verifyToken(context.store.get(SECTION_COOKIE)?.value ?? '', binding(context), secret())
}

export function grantAccess(context, person) {
  context.store.set(person ? PERSON_COOKIE : SECTION_COOKIE, issueToken(binding(context, person), secret()), {
    httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict',
    path: '/', maxAge: UNLOCK_SECONDS,
  })
}

export async function loadPerson(context, id) {
  if (typeof id !== 'string') throw new Error('No se encontró la ficha.')
  const { data, error } = await context.admin.from('people').select('*')
    .eq('user_id', context.user.id).eq('id', id).maybeSingle()
  if (error || !data) throw new Error('No se encontró la ficha.')
  return data
}

export function requirePersonGrant(context, person) {
  if (person.password_hash && !verifyToken(context.store.get(PERSON_COOKIE)?.value ?? '', binding(context, person), secret())) {
    throw new Error('Esta ficha tiene contraseña.')
  }
}

export async function checkPassword(password, hash) {
  return typeof password === 'string' && Buffer.byteLength(password) <= 72 && bcrypt.compare(password, hash)
}

export async function hashPassword(password, { minimumLength = 8 } = {}) {
  if (typeof password !== 'string' || password.length < minimumLength) {
    throw new Error(minimumLength === 1 ? 'Escribí una contraseña.' : 'La contraseña debe tener al menos 8 caracteres.')
  }
  if (Buffer.byteLength(password) > 72) throw new Error('La contraseña no puede superar los 72 bytes.')
  return bcrypt.hash(password, 12)
}

export function toPerson(row) {
  return { id: row.id, name: row.name, position: row.position, hasPassword: row.has_password }
}

export function requireName(name) {
  if (typeof name !== 'string' || !name.trim()) throw new Error('Escribí un nombre.')
  if (name.trim().length > 200) throw new Error('El nombre es demasiado largo.')
  return name.trim()
}

export function checkResult(result, message) {
  if (result.error) throw new Error(message)
  return result.data
}
