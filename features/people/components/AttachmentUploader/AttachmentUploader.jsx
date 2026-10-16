"use client";

import { useRef, useState } from "react";
import { Paperclip, Upload } from "lucide-react";
import { cx } from "@/lib/utils/cx";
import { fileTitle, formatFileSize } from "@/lib/utils/format";
import Button from "@/components/ui/Button/Button";
import Input from "@/components/ui/Input/Input";
import styles from "./AttachmentUploader.module.css";

export const MAX_FILE_SIZE = 10 * 1024 ** 2;

/** Zona para soltar o elegir un archivo y ponerle título antes de subirlo. */
export default function AttachmentUploader({ uploading, onUpload }) {
  const inputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState("");
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState(null);

  function choose(selected) {
    if (!selected) return;
    if (selected.size > MAX_FILE_SIZE) {
      setError(`El archivo pesa ${formatFileSize(selected.size)}; el máximo es ${formatFileSize(MAX_FILE_SIZE)}.`);
      return;
    }
    setError(null);
    setFile(selected);
    setTitle(fileTitle(selected.name));
  }

  function reset() {
    setFile(null);
    setTitle("");
    if (inputRef.current) inputRef.current.value = "";
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const result = await onUpload({ file, title: title.trim() || file.name });
    if (result.ok) reset();
  }

  if (file) {
    return (
      <form className={styles.confirm} onSubmit={handleSubmit}>
        <p className={styles.file}>
          <Paperclip aria-hidden />
          <span>{file.name}</span>
          <span className={styles.size}>{formatFileSize(file.size)}</span>
        </p>
        <Input label="Título" value={title} onChange={(event) => setTitle(event.target.value)} autoFocus maxLength={120} />
        <div className={styles.actions}>
          <Button variant="ghost" size="sm" onClick={reset} disabled={uploading}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary" size="sm" loading={uploading}>
            Adjuntar
          </Button>
        </div>
      </form>
    );
  }

  return (
    <div>
      <label
        className={cx(styles.drop, dragging && styles.dragging)}
        onDragOver={(event) => {
          if (!event.dataTransfer.types.includes("Files")) return;
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          choose(event.dataTransfer.files[0]);
        }}
      >
        <Upload className={styles.icon} aria-hidden />
        <span>
          <strong>Elegí un archivo</strong> o soltalo acá
        </span>
        <span className={styles.hint}>PDF, imágenes, documentos · hasta {formatFileSize(MAX_FILE_SIZE)}</span>
        <input ref={inputRef} type="file" className="visually-hidden" onChange={(event) => choose(event.target.files[0])} />
      </label>
      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
