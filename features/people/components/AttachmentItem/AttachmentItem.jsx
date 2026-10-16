"use client";

import { useState } from "react";
import { Download, Eye, File, FileImage, FileText, Pencil, Trash2 } from "lucide-react";
import { formatFileSize } from "@/lib/utils/format";
import { formatShortDate } from "@/lib/utils/dates";
import { useToday } from "@/lib/hooks/useToday";
import DropdownMenu from "@/components/ui/DropdownMenu/DropdownMenu";
import styles from "./AttachmentItem.module.css";

export function isImage(attachment) {
  return attachment.mimeType?.startsWith("image/");
}

export function isPdf(attachment) {
  return attachment.mimeType === "application/pdf";
}

function TypeIcon({ attachment }) {
  const Icon = isImage(attachment) ? FileImage : isPdf(attachment) ? FileText : File;
  return <Icon aria-hidden />;
}

/** Un adjunto: miniatura o ícono, título editable y acciones. */
export default function AttachmentItem({ attachment, onPreview, onRename, onDelete }) {
  const today = useToday();
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(attachment.title);

  async function commit() {
    setEditing(false);
    const trimmed = title.trim();
    if (!trimmed || trimmed === attachment.title) return setTitle(attachment.title);
    const result = await onRename(attachment.id, trimmed);
    if (!result.ok) setTitle(attachment.title);
  }

  return (
    <li className={styles.item}>
      <button type="button" className={styles.thumb} onClick={() => onPreview(attachment)} aria-label={`Ver ${attachment.title}`}>
        {isImage(attachment) ? (
          // URL firmada y temporal de Supabase Storage: no pasa por el optimizador de imágenes.
          // eslint-disable-next-line @next/next/no-img-element
          <img src={attachment.url} alt="" loading="lazy" />
        ) : (
          <TypeIcon attachment={attachment} />
        )}
      </button>
      <div className={styles.info}>
        {editing ? (
          <input
            className={styles.titleInput}
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            onBlur={commit}
            onKeyDown={(event) => {
              if (event.key === "Enter") event.currentTarget.blur();
              if (event.key === "Escape") {
                setTitle(attachment.title);
                setEditing(false);
              }
            }}
            aria-label="Título del adjunto"
            maxLength={120}
            autoFocus
          />
        ) : (
          <button type="button" className={styles.title} onClick={() => onPreview(attachment)}>
            {attachment.title}
          </button>
        )}
        <p className={styles.meta}>
          <span className={styles.fileName}>{attachment.fileName}</span>
          <span>
            {formatFileSize(attachment.size)} · {formatShortDate(attachment.createdAt, today)}
          </span>
        </p>
      </div>
      <DropdownMenu
        label={`Opciones de ${attachment.title}`}
        items={[
          { id: "view", label: "Ver", icon: Eye, onSelect: () => onPreview(attachment) },
          {
            id: "download",
            label: "Descargar",
            icon: Download,
            onSelect: () => {
              const link = document.createElement("a");
              link.href = attachment.url;
              link.download = attachment.fileName;
              link.click();
            },
          },
          { id: "rename", label: "Cambiar título", icon: Pencil, onSelect: () => setEditing(true) },
          { separator: true },
          { id: "delete", label: "Borrar", icon: Trash2, tone: "danger", onSelect: () => onDelete(attachment) },
        ]}
      />
    </li>
  );
}
