"use client";

import { useId, useState } from "react";
import { ChevronDown } from "lucide-react";
import { cx } from "@/lib/utils/cx";
import { useMediaQuery } from "@/lib/hooks/useMediaQuery";
import Field from "@/components/ui/Field/Field";
import fieldStyles from "@/components/ui/Field/Field.module.css";
import SelectMenu from "./SelectMenu";
import styles from "./Select.module.css";

/** Pantallas táctiles: ahí el select nativo del sistema es lo más cómodo. */
const TOUCH_QUERY = "(hover: none) and (pointer: coarse)";

/**
 * Select con menú propio en la compu y nativo en el celular.
 * options: [{ value, label, color? }] — `color` muestra un punto (categorías).
 * Funciona controlado (`value` + `onChange`) o no (`defaultValue` + `name`).
 * `onChange` recibe un evento con `target.value`, igual que el nativo.
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
  name,
  value: valueProp,
  defaultValue = "",
  onChange,
  disabled,
  ...props
}) {
  const generatedId = useId();
  const id = idProp ?? generatedId;
  // En el servidor se pinta el nativo; en la compu se reemplaza al hidratar.
  const native = useMediaQuery(TOUCH_QUERY, true);
  const [innerValue, setInnerValue] = useState(defaultValue);
  const value = String(valueProp ?? innerValue ?? "");
  const items = placeholder !== undefined ? [{ value: "", label: placeholder, placeholder: true }, ...options] : options;

  function change(next) {
    setInnerValue(next);
    onChange?.({ target: { name, value: next }, currentTarget: { name, value: next } });
  }

  return (
    <Field id={id} label={label} hint={hint} error={error} optional={optional} className={className}>
      {({ describedBy, invalid }) =>
        native ? (
          <div className={styles.wrapper}>
            <select
              ref={ref}
              id={id}
              name={name}
              value={value}
              disabled={disabled}
              onChange={(event) => change(event.target.value)}
              aria-describedby={describedBy}
              aria-invalid={invalid || undefined}
              className={cx(fieldStyles.control, styles.control)}
              {...props}
            >
              {items.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <ChevronDown className={styles.chevron} aria-hidden />
          </div>
        ) : (
          <SelectMenu
            ref={ref}
            id={id}
            name={name}
            items={items}
            value={value}
            disabled={disabled}
            onChange={change}
            describedBy={describedBy}
            invalid={invalid}
            {...props}
          />
        )
      }
    </Field>
  );
}
