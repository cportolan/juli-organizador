"use client";

import { useId } from "react";
import { cx } from "@/lib/utils/cx";
import Field from "@/components/ui/Field/Field";
import fieldStyles from "@/components/ui/Field/Field.module.css";
import styles from "./Input.module.css";

export default function Input({
  label,
  hint,
  error,
  optional,
  icon: Icon,
  suffix,
  className,
  inputClassName,
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
          {Icon && <Icon className={styles.icon} aria-hidden />}
          <input
            ref={ref}
            id={id}
            aria-describedby={describedBy}
            aria-invalid={invalid || undefined}
            className={cx(fieldStyles.control, Icon && styles.withIcon, suffix && styles.withSuffix, inputClassName)}
            {...props}
          />
          {suffix && <div className={styles.suffix}>{suffix}</div>}
        </div>
      )}
    </Field>
  );
}
