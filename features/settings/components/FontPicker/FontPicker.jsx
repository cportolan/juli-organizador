"use client";

import { useId } from "react";
import styles from "./FontPicker.module.css";

/**
 * Opciones de tipografía con muestra en la propia fuente.
 * `role`: "heading" | "body" — define qué variable CSS usa la muestra.
 */
export default function FontPicker({ fonts, value, onChange, role, label, sample }) {
  const name = useId();

  return (
    <div role="radiogroup" aria-label={label} className={styles.grid}>
      {fonts.map((font) => (
        <label key={font.id} className={styles.option} data-font={font.id} data-role={role}>
          <input
            type="radio"
            name={name}
            className={styles.input}
            checked={font.id === value}
            onChange={() => onChange(font.id)}
          />
          <span className={styles.sample}>{sample}</span>
          <span className={styles.name}>{font.label}</span>
        </label>
      ))}
    </div>
  );
}
