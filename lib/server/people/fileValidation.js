import { fileTypeFromBuffer } from 'file-type'

export const MAX_ATTACHMENT_SIZE = 10 * 1024 * 1024
const TYPES = new Map([
  ['application/pdf', ['pdf']], ['image/png', ['png']], ['image/jpeg', ['jpg', 'jpeg']],
  ['image/gif', ['gif']], ['image/webp', ['webp']], ['image/avif', ['avif']],
  ['application/zip', ['zip']],
  ['application/vnd.openxmlformats-officedocument.wordprocessingml.document', ['docx']],
  ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', ['xlsx']],
  ['application/vnd.openxmlformats-officedocument.presentationml.presentation', ['pptx']],
])

export async function validateFile(file) {
  if (!file || typeof file.arrayBuffer !== 'function' || typeof file.name !== 'string') throw new Error('Elegí un archivo.')
  if (!file.size) throw new Error('El archivo está vacío.')
  if (file.size > MAX_ATTACHMENT_SIZE) throw new Error('El archivo no puede superar los 10 MB.')
  if (file.name.length > 255) throw new Error('El nombre del archivo es demasiado largo.')
  const bytes = Buffer.from(await file.arrayBuffer())
  const extension = file.name.split('.').pop().toLowerCase()
  let type
  try { type = await fileTypeFromBuffer(bytes) } catch { throw new Error('El archivo no es válido.') }
  if (type && TYPES.get(type.mime)?.includes(extension) && (!file.type || file.type === type.mime || file.type === 'application/octet-stream')) {
    return { bytes, mimeType: type.mime, extension }
  }
  if (!type && ['txt', 'csv'].includes(extension) && (!file.type || ['text/plain', 'text/csv', 'application/octet-stream'].includes(file.type))) {
    try { new TextDecoder('utf-8', { fatal: true }).decode(bytes) } catch { throw new Error('El archivo de texto no es válido.') }
    if (bytes.includes(0)) throw new Error('El archivo de texto no es válido.')
    return { bytes, mimeType: extension === 'csv' ? 'text/csv' : 'text/plain', extension }
  }
  throw new Error('El tipo de archivo no está permitido o no coincide con su contenido.')
}
