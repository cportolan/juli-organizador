"use client";

import { Clock3, LayoutList, Plus } from "lucide-react";
import { cx } from "@/lib/utils/cx";
import Button from "@/components/ui/Button/Button";
import SegmentedControl from "@/components/ui/SegmentedControl/SegmentedControl";
import styles from "./CalendarDock.module.css";

const VIEW_ITEMS = [
  { id: "mes", label: "Mes" },
  { id: "semana", label: "Semana" },
  { id: "dia", label: "Día" },
];

/** Semana y día: grilla con horarios (se arrastra para crear) o tarjetas por día. */
const LAYOUT_ITEMS = [
  { id: "horas", label: "Con horarios", icon: Clock3 },
  { id: "tarjetas", label: "Tarjetas", icon: LayoutList },
];

const DAY_ITEMS = [
  { id: 7, label: "7 días" },
  { id: 5, label: "5 días" },
  { id: 3, label: "3 días" },
];

/**
 * Menú flotante abajo del calendario (estilo Figma): vista, modo, días y nuevo evento.
 * En el teléfono semana y día son siempre agenda, así que solo quedan la vista y el "+".
 */
export default function CalendarDock({ state, layout, phone = false, onView, onLayout, onDays, onNew }) {
  const showLayout = state.view !== "mes" && !phone;
  return (
    <div className={styles.dock}>
      <div className={styles.bar} role="toolbar" aria-label="Vista del calendario">
        <SegmentedControl label="Vista" items={VIEW_ITEMS} value={state.view} onChange={onView} size="sm" pill={phone} className={styles.views} />
        {showLayout && (
          <>
            <span className={styles.divider} aria-hidden />
            <SegmentedControl label="Mostrar" items={LAYOUT_ITEMS} value={layout} onChange={onLayout} size="sm" iconOnly />
          </>
        )}
        {state.view === "semana" && !phone && (
          <>
            <span className={styles.divider} aria-hidden />
            <SegmentedControl label="Días visibles" items={DAY_ITEMS} value={state.days} onChange={onDays} size="sm" />
          </>
        )}
        <span className={cx(styles.divider, styles.newDivider)} aria-hidden />
        <Button
          variant="primary"
          size="sm"
          icon={Plus}
          onClick={onNew}
          aria-keyshortcuts="n"
          aria-label="Nuevo evento"
          className={styles.newEvent}
        >
          <span className={styles.newLabel}>Evento</span>
        </Button>
      </div>
    </div>
  );
}
