'use client'

import { createClient } from '@/lib/supabase/client'
import { createAttachmentUpload, confirmAttachmentUpload } from './actions'

export async function uploadAttachmentFile(input = {}) {
  try {
    // Compatibility with useAttachments: Claude can change only the service export.
    const { personId, title, file } = input instanceof FormData
      ? { personId: input.get('personId'), title: input.get('title'), file: input.get('file') }
      : input
    if (!file || typeof file.name !== 'string') return { ok: false, error: 'Elegí un archivo.' }
    const prepared = await createAttachmentUpload({ personId, title, fileName: file.name,
      mimeType: file.type, size: file.size })
    if (!prepared.ok) return prepared
    const { uploadId, path, token } = prepared.data
    const { error } = await createClient().storage.from('attachments').uploadToSignedUrl(path, token, file, {
      contentType: file.type || 'application/octet-stream',
    })
    if (error) return { ok: false, error: 'No se pudo subir el archivo. Intentá nuevamente.' }
    return await confirmAttachmentUpload({ uploadId })
  } catch {
    return { ok: false, error: 'No se pudo adjuntar el archivo. Revisá tu conexión e intentá nuevamente.' }
  }
}
