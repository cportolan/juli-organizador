import 'server-only'
import { peopleContext, sectionUnlocked, toPerson, checkResult } from '@/lib/server/people/access'

export async function isPeopleSectionUnlocked() {
  return sectionUnlocked(await peopleContext({ requireSection: false }))
}

export async function getPeople() {
  const context = await peopleContext()
  const rows = checkResult(await context.admin.from('people')
    .select('id, name, position, has_password').eq('user_id', context.user.id)
    .order('position').order('id'), 'No se pudieron cargar las fichas.')
  return rows.map(toPerson)
}
