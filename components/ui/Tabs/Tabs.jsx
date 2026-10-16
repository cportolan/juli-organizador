"use client";

import { useRef } from "react";
import { cx } from "@/lib/utils/cx";
import { useRovingFocus } from "@/lib/hooks/useRovingFocus";
import { useSlidingIndicator } from "@/lib/hooks/useSlidingIndicator";
import styles from "./Tabs.module.css";

/**
 * Lista de pestañas con subrayado animado. Los paneles los renderiza
 * quien la usa, con id `${idPrefix}-panel-${id}` y role="tabpanel".
 * items: [{ id, label, icon?, badge? }]
 */
export default function Tabs({ items, value, onChange, label, idPrefix = "tabs", actions, className }) {
  const ref = useRef(null);
  useSlidingIndicator(ref, value);
  const onKeyDown = useRovingFocus({ items, value, onChange });

  return (
    <div className={cx(styles.bar, className)}>
      <div ref={ref} role="tablist" aria-label={label} className={styles.list} onKeyDown={onKeyDown}>
        {items.map(({ id, label: itemLabel, icon: Icon, badge }) => {
          const active = id === value;
          return (
            <button
              key={id}
              type="button"
              role="tab"
              id={`${idPrefix}-tab-${id}`}
              aria-selected={active}
              aria-controls={`${idPrefix}-panel-${id}`}
              tabIndex={active ? 0 : -1}
              data-active={active}
              className={styles.tab}
              onClick={() => onChange(id)}
            >
              {Icon && <Icon className={styles.icon} aria-hidden />}
              <span>{itemLabel}</span>
              {badge}
            </button>
          );
        })}
        <span className={styles.indicator} aria-hidden />
      </div>
      {actions && <div className={styles.actions}>{actions}</div>}
    </div>
  );
}
