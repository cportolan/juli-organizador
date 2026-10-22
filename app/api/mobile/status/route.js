import { cookies } from 'next/headers'
import { PRIVATE_HEADERS, SIGNED_OUT_COOKIE } from '@/lib/server/mobile/protocol'

export async function GET() {
  return Response.json({ signedOut: (await cookies()).get(SIGNED_OUT_COOKIE)?.value === '1' }, { headers: PRIVATE_HEADERS })
}
