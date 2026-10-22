"use client";

import { useRef } from "react";
import { cx } from "@/lib/utils/cx";
import { useRovingFocus } from "@/lib/hooks/useRovingFocus";
import { useSlidingIndicator } from "@/lib/hooks/useSlidingIndicator";
import styles from "./SegmentedControl.module.css";

/**
 * Selector de una opción entre pocas (vistas, modos).
 * items: [{ id, label, icon? }] — con `iconOnly` muestra solo íconos.
 */
export default function SegmentedControl({ items, value, onChange, label, iconOnly = false, size = "md", pill = false, className }) {
  const ref = useRef(null);
  useSlidingIndicator(ref, value);
  const onKeyDown = useRovingFocus({ items, value, onChange });

  return (
    <div
      ref={ref}
      role="radiogroup"
      aria-label={label}
      className={cx(styles.group, styles[size], pill && styles.pill, className)}
      onKeyDown={onKeyDown}
    >
      <span className={styles.indicator} aria-hidden />
      {items.map(({ id, label: itemLabel, icon: Icon }) => {
        const active = id === value;
        return (
          <button
            key={id}
            type="button"
            role="radio"
            aria-checked={active}
            aria-label={iconOnly ? itemLabel : undefined}
            title={iconOnly ? itemLabel : undefined}
            tabIndex={active ? 0 : -1}
            data-active={active}
            className={styles.option}
            onClick={() => onChange(id)}
          >
            {Icon && <Icon className={styles.icon} aria-hidden />}
            {!iconOnly && <span>{itemLabel}</span>}
          </button>
        );
      })}
    </div>
  );
}
