"use client";

import { useId } from "react";
import { Check, Pipette } from "lucide-react";
import { cx } from "@/lib/utils/cx";
import styles from "./ColorSwatches.module.css";

/**
 * Selector de color por muestras. Se reutiliza para el primario,
 * categorías y eventos. options: [{ id, label, value }] (value = color CSS).
 * Con `allowCustom` agrega un selector de color libre.
 */
export default function ColorSwatches({ options, value, onChange, label, allowCustom = false, size = "md" }) {
  const name = useId();
  const isCustom = allowCustom && !options.some((option) => option.value === value);

  return (
    <div role="radiogroup" aria-label={label} className={cx(styles.swatches, styles[size])}>
      {options.map((option) => (
        <label key={option.id} className={styles.swatch} style={{ "--swatch": option.value }} title={option.label}>
          <input
            type="radio"
            name={name}
            className={styles.input}
            checked={option.value === value}
            onChange={() => onChange(option.value)}
            aria-label={option.label}
          />
          <Check className={styles.check} strokeWidth={3} aria-hidden />
        </label>
      ))}
      {allowCustom && (
        <label
          className={cx(styles.swatch, styles.custom, isCustom && styles.customActive)}
          style={isCustom ? { "--swatch": value } : undefined}
          title="Elegir otro color"
        >
          <input
            type="color"
            className={styles.colorInput}
            value={value}
            onChange={(event) => onChange(event.target.value)}
            aria-label="Elegir otro color"
          />
          <Pipette className={styles.pipette} aria-hidden />
        </label>
      )}
    </div>
  );
}
