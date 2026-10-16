"use client";

import { Download } from "lucide-react";
import Button from "@/components/ui/Button/Button";
import Modal from "@/components/ui/Modal/Modal";
import { isImage, isPdf } from "../AttachmentItem/AttachmentItem";
import styles from "./AttachmentPreview.module.css";

/** Vista previa de un adjunto: imagen, PDF o, si no se puede mostrar, descarga. */
export default function AttachmentPreview({ attachment, onClose }) {
  return (
    <Modal
      open={attachment !== null}
      onClose={onClose}
      title={attachment?.title}
      description={attachment?.fileName}
      size="lg"
      footer={
        attachment && (
          <Button href={attachment.url} download={attachment.fileName} icon={Download} target="_blank" rel="noreferrer">
            Descargar
          </Button>
        )
      }
    >
      {attachment && (
        <div className={styles.preview}>
          {isImage(attachment) ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={attachment.url} alt={attachment.title} className={styles.image} />
          ) : isPdf(attachment) ? (
            <iframe src={attachment.url} title={attachment.title} className={styles.pdf} />
          ) : (
            <p className={styles.none}>Este tipo de archivo no se puede ver acá. Descargalo para abrirlo.</p>
          )}
        </div>
      )}
    </Modal>
  );
}
