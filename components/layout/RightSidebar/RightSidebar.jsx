"use client";

import { useEffect, useState } from "react";
import { PanelRightClose, PanelRightOpen, X } from "lucide-react";
import { cx } from "@/lib/utils/cx";
import { useMediaQuery } from "@/lib/hooks/useMediaQuery";
import { useStoredState } from "@/lib/hooks/useStoredState";
import IconButton from "@/components/ui/IconButton/IconButton";
import styles from "./RightSidebar.module.css";

const NARROW_QUERY = "(max-width: 1100px)";

/**
 * Panel lateral derecho plegable (lo usa el calendario para nota y pendientes).
 * En desktop se recuerda abierto/cerrado por `storageKey`; en pantallas
 * angostas se vuelve una hoja que se abre con el botón flotante `fabIcon`.
 */
export default function RightSidebar({ title, storageKey = "oj-right-sidebar", actions, fabIcon: FabIcon, children }) {
  const [open, setOpen] = useStoredState(storageKey, true);
  const [sheetOpen, setSheetOpen] = useState(false);
  const narrow = useMediaQuery(NARROW_QUERY);
  const visible = narrow ? sheetOpen : open;

  useEffect(() => {
    if (!sheetOpen) return;
    const handleKey = (event) => event.key === "Escape" && setSheetOpen(false);
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [sheetOpen]);

  return (
    <>
      <aside
        className={cx(styles.panel, !open && styles.closed, sheetOpen && styles.sheetOpen)}
        aria-label={title}
      >
        <div className={styles.header}>
          {narrow ? (
            <IconButton icon={X} label="Cerrar" tooltip={false} onClick={() => setSheetOpen(false)} />
          ) : (
            <IconButton
              icon={open ? PanelRightClose : PanelRightOpen}
              label={open ? `Ocultar ${title.toLowerCase()}` : `Mostrar ${title.toLowerCase()}`}
              tooltipSide="left"
              onClick={() => setOpen((value) => !value)}
            />
          )}
          <h2 className={styles.title}>{title}</h2>
          {actions && <div className={styles.actions}>{actions}</div>}
        </div>
        <div className={styles.body} inert={!visible}>
          {children}
        </div>
      </aside>
      {FabIcon && (
        <button type="button" className={styles.fab} onClick={() => setSheetOpen(true)} aria-label={title}>
          <FabIcon aria-hidden />
        </button>
      )}
      <div className={cx(styles.scrim, sheetOpen && styles.scrimVisible)} onClick={() => setSheetOpen(false)} aria-hidden />
    </>
  );
}
