import 'server-only'
import { checkResult } from './access'
import { validateFile } from './fileValidation'

// Read a bounded prefix for raster/PDF files. ZIP/OpenXML and text need the whole
// (already size-checked) object to inspect container entries / UTF-8 safely.
export async function inspectUpload(context, upload) {
  const bucket = context.admin.storage.from('attachments')
  const info = checkResult(await bucket.info(upload.staging_path), 'No se encontró el archivo subido.')
  const size = Number(info.size ?? info.metadata?.size)
  const mimeType = info.contentType ?? info.metadata?.mimetype
  if (size !== Number(upload.size) || size < 1 || size > 10 * 1024 * 1024) throw new Error('El tamaño real del archivo no coincide con el declarado.')
  if (mimeType !== upload.mime_type && mimeType !== 'application/octet-stream') throw new Error('El tipo real del archivo no coincide con el declarado.')
  if (info.contentEncoding && info.contentEncoding !== 'identity') throw new Error('La codificación del archivo no está permitida.')
  const whole = /\.(zip|docx|xlsx|pptx|txt|csv)$/i.test(upload.file_name)
  const limit = whole ? size : Math.min(size, 65536)
  const { signedUrl } = checkResult(await bucket.createSignedUrl(upload.staging_path, 60), 'No se pudo verificar el archivo subido.')
  const response = await fetch(signedUrl, { headers: { Range: `bytes=0-${limit - 1}` }, cache: 'no-store', signal: AbortSignal.timeout(30000) })
  if (!response.ok || !response.body) throw new Error('No se pudo leer el archivo subido.')
  const reader = response.body.getReader()
  const chunks = []
  let length = 0
  try {
    while (length < limit) {
      const { done, value } = await reader.read()
      if (done) break
      const chunk = value.subarray(0, limit - length)
      chunks.push(chunk)
      length += chunk.length
    }
  } finally {
    await reader.cancel()
  }
  if (length !== limit) throw new Error('El archivo subido está incompleto.')
  const bytes = Buffer.concat(chunks)
  const validated = await validateFile({ name: upload.file_name, type: upload.mime_type, size,
    arrayBuffer: async () => bytes })
  return { size, mimeType: validated.mimeType }
}
