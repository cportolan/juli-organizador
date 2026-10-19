"use client";

import { useState } from "react";
import Button from "@/components/ui/Button/Button";
import PasswordInput from "@/components/ui/PasswordInput/PasswordInput";
import styles from "./PasswordChangeForm.module.css";

export const MIN_PASSWORD_LENGTH = 8;

/**
 * Poner, cambiar o quitar una contraseña. mode: "set" | "change" | "remove".
 * `onSubmit({ currentPassword, newPassword })` devuelve { ok, error }; si el
 * error habla de la contraseña actual, se muestra en ese campo.
 * `minLength` en 1 permite cualquier contraseña no vacía.
 */
export default function PasswordChangeForm({
  mode,
  username,
  onSubmit,
  onCancel,
  loading = false,
  minLength = MIN_PASSWORD_LENGTH,
  className,
}) {
  const [errors, setErrors] = useState({});

  async function handleSubmit(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const current = form.get("current") || undefined;
    const next = String(form.get("next") ?? "");
    const confirm = form.get("confirm");

    const found = {};
    if (mode !== "set" && !current) found.current = "Escribí la contraseña actual.";
    if (mode !== "remove") {
      if (!next) found.next = "Escribí una contraseña.";
      else if (next.length < minLength) found.next = `Tiene que tener al menos ${minLength} caracteres.`;
      else if (next !== confirm) found.confirm = "Las contraseñas no coinciden.";
    }
    setErrors(found);
    if (Object.keys(found).length) return;

    const result = await onSubmit({ currentPassword: current, newPassword: mode === "remove" ? null : next });
    if (!result.ok && /actual/i.test(result.error ?? "")) setErrors({ current: result.error });
  }

  return (
    <form className={className ?? styles.form} onSubmit={handleSubmit} noValidate>
      {/* Campo oculto para que el gestor de contraseñas sepa a qué corresponde */}
      <input type="text" name="username" value={username} autoComplete="username" readOnly hidden />
      {mode !== "set" && <PasswordInput name="current" label="Contraseña actual" error={errors.current} />}
      {mode !== "remove" && (
        <>
          <PasswordInput
            name="next"
            label={mode === "change" ? "Nueva contraseña" : "Contraseña"}
            hint={minLength > 1 ? `Mínimo ${minLength} caracteres.` : undefined}
            error={errors.next}
            autoComplete="new-password"
          />
          <PasswordInput name="confirm" label="Repetila" error={errors.confirm} autoComplete="new-password" />
        </>
      )}
      <div className={styles.actions}>
        <Button type="submit" variant={mode === "remove" ? "danger" : "primary"} loading={loading}>
          {mode === "remove" ? "Quitar contraseña" : "Guardar"}
        </Button>
        {onCancel && (
          <Button variant="ghost" onClick={onCancel} disabled={loading}>
            Cancelar
          </Button>
        )}
      </div>
    </form>
  );
}
