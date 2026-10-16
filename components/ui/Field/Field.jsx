import { cx } from "@/lib/utils/cx";
import styles from "./Field.module.css";

/**
 * Envoltorio común de los campos de formulario: label, ayuda y error.
 * Lo usan Input, Textarea y Select para no repetir esta estructura.
 */
export default function Field({ id, label, hint, error, optional, className, children }) {
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined;

  return (
    <div className={cx(styles.field, className)}>
      {label && (
        <label htmlFor={id} className={styles.label}>
          {label}
          {optional && <span className={styles.optional}>opcional</span>}
        </label>
      )}
      {children({ describedBy, invalid: Boolean(error) })}
      {error ? (
        <p id={`${id}-error`} className={styles.error} role="alert">
          {error}
        </p>
      ) : (
        hint && (
          <p id={`${id}-hint`} className={styles.hint}>
            {hint}
          </p>
        )
      )}
    </div>
  );
}
