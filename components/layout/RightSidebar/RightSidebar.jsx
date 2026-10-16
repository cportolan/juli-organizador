"use client";

import { PanelRightClose, PanelRightOpen } from "lucide-react";
import { cx } from "@/lib/utils/cx";
import { useStoredState } from "@/lib/hooks/useStoredState";
import IconButton from "@/components/ui/IconButton/IconButton";
import styles from "./RightSidebar.module.css";

/**
 * Panel lateral derecho plegable (lo usa el calendario para los pendientes).
 * Se recuerda abierto/cerrado por `storageKey`.
 */
export default function RightSidebar({ title, storageKey = "oj-right-sidebar", actions, children }) {
  const [open, setOpen] = useStoredState(storageKey, true);

  return (
    <aside className={cx(styles.panel, !open && styles.closed)} aria-label={title}>
      <div className={styles.header}>
        <IconButton
          icon={open ? PanelRightClose : PanelRightOpen}
          label={open ? `Ocultar ${title.toLowerCase()}` : `Mostrar ${title.toLowerCase()}`}
          tooltipSide="left"
          onClick={() => setOpen((value) => !value)}
        />
        <h2 className={styles.title}>{title}</h2>
        {actions && <div className={styles.actions}>{actions}</div>}
      </div>
      <div className={styles.body} inert={!open}>
        {children}
      </div>
    </aside>
  );
}
