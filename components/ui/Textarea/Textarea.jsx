"use client";

import { useId } from "react";
import { cx } from "@/lib/utils/cx";
import Field from "@/components/ui/Field/Field";
import fieldStyles from "@/components/ui/Field/Field.module.css";
import styles from "./Textarea.module.css";

export default function Textarea({ label, hint, error, optional, className, id: idProp, rows = 4, ref, ...props }) {
  const generatedId = useId();
  const id = idProp ?? generatedId;

  return (
    <Field id={id} label={label} hint={hint} error={error} optional={optional} className={className}>
      {({ describedBy, invalid }) => (
        <textarea
          ref={ref}
          id={id}
          rows={rows}
          aria-describedby={describedBy}
          aria-invalid={invalid || undefined}
          className={cx(fieldStyles.control, styles.textarea)}
          {...props}
        />
      )}
    </Field>
  );
}
