import 'server-only'
import { actionError } from '@/lib/server/actionResult'

export async function peopleAction(operation) {
  try {
    return await operation()
  } catch (error) {
    return actionError(error instanceof Error ? error.message : 'No se pudo completar la operación.')
  }
}
