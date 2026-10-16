"use client";

import { useState } from "react";
import { RotateCw } from "lucide-react";
import Button from "@/components/ui/Button/Button";
import ConfirmDialog from "@/components/ui/ConfirmDialog/ConfirmDialog";
import Skeleton from "@/components/ui/Skeleton/Skeleton";
import { useAttachments } from "../../hooks/useAttachments";
import AttachmentItem from "../AttachmentItem/AttachmentItem";
import AttachmentUploader from "../AttachmentUploader/AttachmentUploader";
import AttachmentPreview from "../AttachmentPreview/AttachmentPreview";
import styles from "./AttachmentsPanel.module.css";

/** Archivos adjuntos de una ficha. */
export default function AttachmentsPanel({ personId }) {
  const attachments = useAttachments(personId);
  const [preview, setPreview] = useState(null);
  const [deleting, setDeleting] = useState(null);

  async function handleDelete() {
    const result = await attachments.remove(deleting.id);
    if (result.ok) setDeleting(null);
  }

  return (
    <section className={styles.panel} aria-labelledby="attachments-title">
      <h3 id="attachments-title" className={styles.title}>
        Adjuntos
        {attachments.status === "ready" && attachments.items.length > 0 && (
          <span className={styles.count}>{attachments.items.length}</span>
        )}
      </h3>

      <AttachmentUploader uploading={attachments.uploading} onUpload={attachments.upload} />

      {attachments.status === "loading" && (
        <div className={styles.loading} aria-busy="true">
          <Skeleton height={44} radius="var(--radius-sm)" />
          <Skeleton height={44} radius="var(--radius-sm)" />
        </div>
      )}
      {attachments.status === "error" && (
        <div className={styles.error}>
          <p>No se pudieron cargar los adjuntos.</p>
          <Button size="sm" variant="ghost" icon={RotateCw} onClick={attachments.retry}>
            Reintentar
          </Button>
        </div>
      )}
      {attachments.status === "ready" &&
        (attachments.items.length ? (
          <ul className={styles.list}>
            {attachments.items.map((attachment) => (
              <AttachmentItem
                key={attachment.id}
                attachment={attachment}
                onPreview={setPreview}
                onRename={attachments.rename}
                onDelete={setDeleting}
              />
            ))}
          </ul>
        ) : (
          <p className={styles.empty}>Todavía no hay archivos. Podés sumar PDFs, fotos o documentos.</p>
        ))}

      <AttachmentPreview attachment={preview} onClose={() => setPreview(null)} />
      <ConfirmDialog
        open={deleting !== null}
        onClose={() => setDeleting(null)}
        onConfirm={handleDelete}
        loading={attachments.deleting}
        title="¿Borrar este adjunto?"
        description={deleting ? `${deleting.title} (${deleting.fileName})` : undefined}
      />
    </section>
  );
}
