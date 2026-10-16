"use client";

import { useId } from "react";
import { Check } from "lucide-react";
import { cx } from "@/lib/utils/cx";
import styles from "./Checkbox.module.css";

/** Checkbox nativo con animación de tilde. `label` puede ocultarse con `hideLabel`. */
export default function Checkbox({ label, hideLabel = false, className, id: idProp, ...props }) {
  const generatedId = useId();
  const id = idProp ?? generatedId;

  return (
    <label htmlFor={id} className={cx(styles.checkbox, className)}>
      <span className={styles.box}>
        <input id={id} type="checkbox" className={styles.input} {...props} />
        <Check className={styles.check} strokeWidth={3} aria-hidden />
      </span>
      <span className={hideLabel ? "visually-hidden" : styles.label}>{label}</span>
    </label>
  );
}
