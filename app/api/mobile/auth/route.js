import { createClient } from '@supabase/supabase-js'
import { createAdminClient } from '@/lib/supabase/admin'
import { acceptsOrigin, PRIVATE_HEADERS, readBody, sealTicket } from '@/lib/server/mobile/protocol'

const reply = (data, status = 200) => Response.json(data, { status, headers: PRIVATE_HEADERS })

export async function POST(request) {
  if (!acceptsOrigin(request)) return reply({ error: 'Origen no permitido.' }, 403)
  if (!request.headers.get('content-type')?.startsWith('application/json')) return reply({ error: 'Formato inválido.' }, 415)
  let input
  try { input = JSON.parse(await readBody(request)) } catch { return reply({ error: 'Solicitud inválida.' }, 400) }
  const passwordGrant = input?.grant === 'password'
  const refreshGrant = input?.grant === 'refresh'
  if ((!passwordGrant && !refreshGrant) || (passwordGrant &&
      (typeof input.email !== 'string' || input.email.length > 254 || !input.email.includes('@') ||
       typeof input.password !== 'string' || !input.password || input.password.length > 1024)) ||
      (refreshGrant && (typeof input.refreshToken !== 'string' || !input.refreshToken || input.refreshToken.length > 2048))) {
    return reply({ error: 'Completá los datos para ingresar.' }, 400)
  }
  try {
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
      { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } })
    const { data, error } = passwordGrant
      ? await supabase.auth.signInWithPassword({ email: input.email.trim(), password: input.password })
      : await supabase.auth.refreshSession({ refresh_token: input.refreshToken })
    if (error || !data.session || !data.user?.email_confirmed_at) {
      const status = error?.status === 429 ? 429 : error?.status >= 500 ? 503 : 401
      return reply({ error: status === 429 ? 'Esperá un momento antes de volver a intentar.' : status === 503
        ? 'No pudimos conectar. Volvé a intentar.' : passwordGrant ? 'Revisá tu email y contraseña.' : 'Ingresá con tu contraseña para renovar el acceso.' }, status)
    }
    // Separate session: WebView refresh rotation cannot invalidate the native credential.
    // Identity comes ONLY from the authenticated user, never from a requested email/id.
    const { data: link, error: linkError } = await createAdminClient().auth.admin.generateLink({ type: 'magiclink', email: data.user.email })
    if (linkError || link.user?.id !== data.user.id || !link.properties?.hashed_token) throw new Error('Ticket unavailable')
    const ticket = sealTicket({ tokenHash: link.properties.hashed_token, userId: data.user.id }, process.env.PEOPLE_COOKIE_SECRET)
    return reply({ email: data.user.email, refreshToken: data.session.refresh_token, ticket })
  } catch {
    return reply({ error: 'No pudimos abrir tu agenda. Volvé a intentar en un momento.' }, 503)
  }
}
