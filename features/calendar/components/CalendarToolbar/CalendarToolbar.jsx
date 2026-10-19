"use client";

import { ChevronLeft, ChevronRight, Clock3, LayoutList, LoaderCircle, Plus } from "lucide-react";
import Button from "@/components/ui/Button/Button";
import IconButton from "@/components/ui/IconButton/IconButton";
import SegmentedControl from "@/components/ui/SegmentedControl/SegmentedControl";
import styles from "./CalendarToolbar.module.css";

const VIEW_ITEMS = [
  { id: "mes", label: "Mes" },
  { id: "semana", label: "Semana" },
  { id: "dia", label: "Día" },
];

const DAY_ITEMS = [
  { id: 7, label: "7 días" },
  { id: 5, label: "5 días" },
  { id: 3, label: "3 días" },
];

/** Semana y día: grilla con horarios (se arrastra para crear) o tarjetas por día. */
export const LAYOUT_ITEMS = [
  { id: "horas", label: "Con horarios", icon: Clock3 },
  { id: "tarjetas", label: "Tarjetas", icon: LayoutList },
];

/** Navegación del calendario: hoy, anterior/siguiente, período y vista. */
export default function CalendarToolbar({
  state,
  label,
  pending,
  isCurrent,
  layout,
  onToday,
  onStep,
  onView,
  onDays,
  onLayout,
  onNew,
}) {
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
      <div className={styles.views}>
        <SegmentedControl label="Vista" items={VIEW_ITEMS} value={state.view} onChange={onView} size="sm" />
        {state.view !== "mes" && (
          <SegmentedControl label="Mostrar" items={LAYOUT_ITEMS} value={layout} onChange={onLayout} size="sm" iconOnly />
        )}
        {state.view === "semana" && (
          <SegmentedControl label="Días visibles" items={DAY_ITEMS} value={state.days} onChange={onDays} size="sm" />
        )}
        <Button variant="primary" icon={Plus} onClick={onNew} aria-keyshortcuts="n" className={styles.new}>
          Evento
        </Button>
      </div>
    </div>
  );
}
