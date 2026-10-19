"use client";

import { ChevronLeft, ChevronRight, LoaderCircle } from "lucide-react";
import Button from "@/components/ui/Button/Button";
import IconButton from "@/components/ui/IconButton/IconButton";
import styles from "./CalendarToolbar.module.css";

/** Barra de arriba del calendario: hoy, anterior/siguiente y el período. La vista está en CalendarDock. */
export default function CalendarToolbar({ label, pending, isCurrent, onToday, onStep }) {
  return (
    <div className={styles.toolbar}>
      <div className={styles.nav}>
        <Button size="sm" onClick={onToday} disabled={isCurrent} aria-keyshortcuts="t">
          Hoy
        </Button>
        <IconButton icon={ChevronLeft} label="Anterior" onClick={() => onStep(-1)} aria-keyshortcuts="ArrowLeft" />
        <IconButton icon={ChevronRight} label="Siguiente" onClick={() => onStep(1)} aria-keyshortcuts="ArrowRight" />
      </div>
      <h2 className={styles.period} aria-live="polite">
        {label}
        {pending && <LoaderCircle className={styles.spinner} aria-label="Cargando" />}
      </h2>
    </div>
  );
}
