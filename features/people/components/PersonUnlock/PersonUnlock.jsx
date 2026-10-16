"use client";

import { useState } from "react";
import { Lock } from "lucide-react";
import Button from "@/components/ui/Button/Button";
import PasswordInput from "@/components/ui/PasswordInput/PasswordInput";
import styles from "./PersonUnlock.module.css";

/** Pide la contraseña propia de una ficha. */
export default function PersonUnlock({ name, error, onUnlock }) {
  const [busy, setBusy] = useState(false);
  const [localError, setLocalError] = useState(null);

  async function handleSubmit(event) {
    event.preventDefault();
    const password = new FormData(event.currentTarget).get("password");
    if (!password) return setLocalError("Escribí la contraseña.");
    setBusy(true);
    const result = await onUnlock(password);
    setBusy(false);
    if (!result.ok) setLocalError(null);
  }

  const message = localError ?? (error && error !== "Esta ficha tiene contraseña." ? error : null);

  return (
    <form className={styles.unlock} onSubmit={handleSubmit} noValidate>
      <Lock className={styles.icon} aria-hidden />
      <p className={styles.text}>
        La ficha de <strong>{name}</strong> tiene contraseña.
      </p>
      <input type="text" name="username" value={name} autoComplete="username" readOnly hidden />
      <div className={styles.row}>
        <PasswordInput
          name="password"
          aria-label={`Contraseña de la ficha de ${name}`}
          placeholder="Contraseña de la ficha"
          error={message}
          onChange={() => setLocalError(null)}
          autoFocus
          className={styles.input}
        />
        <Button type="submit" variant="primary" loading={busy}>
          Abrir
        </Button>
      </div>
    </form>
  );
}
