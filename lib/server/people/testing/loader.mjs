import { fileURLToPath, pathToFileURL } from 'node:url'
import path from 'node:path'

const root = fileURLToPath(new URL('../../../../', import.meta.url))
export async function resolve(specifier, context, nextResolve) {
  if (['server-only', 'next/headers', '@/lib/supabase/server', '@/lib/supabase/admin'].includes(specifier)) {
    return { url: new URL('./services.mjs', import.meta.url).href, shortCircuit: true }
  }
  if (specifier.startsWith('@/')) {
    return nextResolve(pathToFileURL(path.join(root, `${specifier.slice(2)}.js`)).href, context)
  }
  if (specifier.startsWith('.') && context.parentURL?.endsWith('.js') && !path.extname(specifier)) {
    return nextResolve(`${specifier}.js`, context)
  }
  return nextResolve(specifier, context)
}
