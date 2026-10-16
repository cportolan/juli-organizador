"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { LockKeyhole } from "lucide-react";
import Button from "@/components/ui/Button/Button";
import PasswordInput from "@/components/ui/PasswordInput/PasswordInput";
import { unlockPeopleSection } from "../../hooks/peopleService";
import styles from "./PeopleLockScreen.module.css";

/** Pantalla de contraseña general de la sección Usuarios. */
export default function PeopleLockScreen() {
  const router = useRouter();
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  const [refreshing, startTransition] = useTransition();

  async function handleSubmit(event) {
    event.preventDefault();
    const password = new FormData(event.currentTarget).get("password");
    if (!password) return setError("Escribí la contraseña.");
    setBusy(true);
    try {
      const result = await unlockPeopleSection(password);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      startTransition(() => router.refresh());
    } catch {
      setError("No se pudo conectar. Probá de nuevo.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className={styles.screen}>
      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        <div className={styles.art} aria-hidden>
          <LockKeyhole />
        </div>
        <h2 className={styles.title}>Fichas protegidas</h2>
        <p className={styles.text}>Escribí la contraseña de Usuarios para ver las fichas.</p>
        <input type="text" name="username" value="usuarios" autoComplete="username" readOnly hidden />
        <PasswordInput
          name="password"
          label="Contraseña"
          error={error}
          onChange={() => error && setError(null)}
          autoFocus
          className={styles.input}
        />
        <Button type="submit" variant="primary" loading={busy || refreshing} fullWidth>
          Entrar
        </Button>
      </form>
    </div>
  );
}
