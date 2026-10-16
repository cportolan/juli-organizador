"use client";

import { useId } from "react";
import { ChevronDown } from "lucide-react";
import { cx } from "@/lib/utils/cx";
import Field from "@/components/ui/Field/Field";
import fieldStyles from "@/components/ui/Field/Field.module.css";
import styles from "./Select.module.css";

/**
 * Select nativo con estilo propio (accesible y cómodo en mobile).
 * options: [{ value, label }]
 */
export default function Select({
  label,
  hint,
  error,
  optional,
  options = [],
  placeholder,
  className,
  id: idProp,
  ref,
  ...props
}) {
  const generatedId = useId();
  const id = idProp ?? generatedId;

  return (
    <Field id={id} label={label} hint={hint} error={error} optional={optional} className={className}>
      {({ describedBy, invalid }) => (
        <div className={styles.wrapper}>
          <select
            ref={ref}
            id={id}
            aria-describedby={describedBy}
            aria-invalid={invalid || undefined}
            className={cx(fieldStyles.control, styles.select)}
            {...props}
          >
            {placeholder !== undefined && <option value="">{placeholder}</option>}
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <ChevronDown className={styles.chevron} aria-hidden />
        </div>
      )}
    </Field>
  );
}
