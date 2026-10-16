"use client";

import { useEffect, useId, useRef } from "react";
import { X } from "lucide-react";
import { cx } from "@/lib/utils/cx";
import IconButton from "@/components/ui/IconButton/IconButton";
import styles from "./Modal.module.css";

/**
 * Diálogo modal sobre <dialog> nativo (foco atrapado, Escape y backdrop gratis).
 * placement: "center" | "right" (el Drawer usa "right")
 * size: "sm" | "md" | "lg"
 */
export default function Modal({
  open,
  onClose,
  title,
  description,
  footer,
  placement = "center",
  size = "md",
  className,
  children,
}) {
  const dialogRef = useRef(null);
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      dialog.showModal();
      // showModal enfoca el primer botón (la X); en formularios es mejor arrancar en el primer campo.
      dialog.querySelector(`.${styles.body} :is(input:not([type="hidden"]), textarea, select)`)?.focus();
    }
    if (!open && dialog.open) dialog.close();
  }, [open]);

  function handleCancel(event) {
    event.preventDefault();
    onClose?.();
  }

  function handleBackdropClick(event) {
    if (event.target === dialogRef.current) onClose?.();
  }

  return (
    <dialog
      ref={dialogRef}
      className={cx(styles.dialog, styles[placement], styles[size], className)}
      aria-labelledby={title ? titleId : undefined}
      aria-describedby={description ? descriptionId : undefined}
      onCancel={handleCancel}
      onClick={handleBackdropClick}
    >
      <div className={styles.panel}>
        {(title || onClose) && (
          <header className={styles.header}>
            <div className={styles.heading}>
              {title && (
                <h2 id={titleId} className={styles.title}>
                  {title}
                </h2>
              )}
              {description && (
                <p id={descriptionId} className={styles.description}>
                  {description}
                </p>
              )}
            </div>
            {onClose && <IconButton icon={X} label="Cerrar" size="sm" tooltip={false} onClick={onClose} />}
          </header>
        )}
        {children ? <div className={styles.body}>{children}</div> : <div className={styles.spacer} />}
        {footer && <footer className={styles.footer}>{footer}</footer>}
      </div>
    </dialog>
  );
}
