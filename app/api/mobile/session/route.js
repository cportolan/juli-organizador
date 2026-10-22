import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import { acceptsNativeNavigation, openTicket, PRIVATE_HEADERS, readBody, SIGNED_OUT_COOKIE } from '@/lib/server/mobile/protocol'

export async function POST(request) {
  const failure = () => NextResponse.redirect(new URL('/login?mobile=expired', request.url), { status: 303, headers: PRIVATE_HEADERS })
  if (!acceptsNativeNavigation(request)) return new Response(null, { status: 403, headers: PRIVATE_HEADERS })
  let ticket
  try { ticket = openTicket(new URLSearchParams(await readBody(request)).get('ticket'), process.env.PEOPLE_COOKIE_SECRET) }
  catch { return failure() }
  if (!ticket) return failure()
  const response = NextResponse.redirect(new URL('/calendario', request.url), { status: 303, headers: PRIVATE_HEADERS })
  try {
    const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY, {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: cookies => cookies.forEach(({ name, value, options }) => response.cookies.set(name, value, options)),
      },
    })
    const { data, error } = await supabase.auth.verifyOtp({ token_hash: ticket.tokenHash, type: 'magiclink' })
    if (error || data.user?.id !== ticket.userId) return failure()
    response.cookies.delete(SIGNED_OUT_COOKIE)
    return response
  } catch { return failure() }
}
