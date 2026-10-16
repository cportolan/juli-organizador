"use client";

import { useState } from "react";
import { KeyRound, LockKeyhole, LockKeyholeOpen } from "lucide-react";
import { useMutation } from "@/lib/hooks/useMutation";
import { setPeoplePassword } from "@/features/settings/actions";
import Button from "@/components/ui/Button/Button";
import PasswordInput from "@/components/ui/PasswordInput/PasswordInput";
import SettingsSection from "../SettingsSection/SettingsSection";
import styles from "./PeoplePasswordSettings.module.css";

const MIN_LENGTH = 8;

const MESSAGES = {
  set: "Contraseña activada",
  change: "Contraseña cambiada",
  remove: "Contraseña quitada",
};

/** Contraseña general para entrar a Usuarios: activar, cambiar o quitar. */
export default function PeoplePasswordSettings({ initialEnabled }) {
  const [enabled, setEnabled] = useState(initialEnabled);
  const [mode, setMode] = useState(null); // null | "set" | "change" | "remove"
  const [errors, setErrors] = useState({});
  const [save, saving] = useMutation(setPeoplePassword, { successMessage: mode ? MESSAGES[mode] : undefined });

  async function handleSubmit(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const current = form.get("current") ?? undefined;
    const next = form.get("next");
    const confirm = form.get("confirm");

    const found = {};
    if (mode !== "set" && !current) found.current = "Escribí la contraseña actual.";
    if (mode !== "remove") {
      if (String(next).length < MIN_LENGTH) found.next = `Tiene que tener al menos ${MIN_LENGTH} caracteres.`;
      else if (next !== confirm) found.confirm = "Las contraseñas no coinciden.";
    }
    setErrors(found);
    if (Object.keys(found).length) return;

    const result = await save({ currentPassword: current || undefined, newPassword: mode === "remove" ? null : next });
    if (!result.ok) {
      if (/actual/i.test(result.error ?? "")) setErrors({ current: result.error });
      return;
    }
    setEnabled(result.data.peopleLockEnabled);
    setMode(null);
  }

  function cancel() {
    setMode(null);
    setErrors({});
  }

  const StatusIcon = enabled ? LockKeyhole : LockKeyholeOpen;

  return (
    <SettingsSection
      title="Contraseña de Usuarios"
      description="Se pide al entrar a la sección de fichas. Cada ficha puede tener, además, la suya."
    >
      <div className={styles.status} data-enabled={enabled}>
        <StatusIcon className={styles.icon} aria-hidden />
        <p>{enabled ? "Activada. Las fichas piden contraseña." : "Sin contraseña. Las fichas se abren directo."}</p>
      </div>

      {mode === null ? (
        <div className={styles.actions}>
          {enabled ? (
            <>
              <Button icon={KeyRound} onClick={() => setMode("change")}>
                Cambiar contraseña
              </Button>
              <Button variant="ghost" onClick={() => setMode("remove")}>
                Quitar
              </Button>
            </>
          ) : (
            <Button variant="primary" icon={KeyRound} onClick={() => setMode("set")}>
              Poner contraseña
            </Button>
          )}
        </div>
      ) : (
        <form key={mode} className={styles.form} onSubmit={handleSubmit} noValidate>
          {/* Campo oculto para que el navegador asocie la contraseña a esta sección */}
          <input type="text" name="username" value="usuarios" autoComplete="username" readOnly hidden />
          {mode !== "set" && (
            <PasswordInput name="current" label="Contraseña actual" error={errors.current} autoFocus />
          )}
          {mode !== "remove" && (
            <>
              <PasswordInput
                name="next"
                label={mode === "change" ? "Nueva contraseña" : "Contraseña"}
                hint={`Mínimo ${MIN_LENGTH} caracteres.`}
                error={errors.next}
                autoComplete="new-password"
                autoFocus={mode === "set"}
              />
              <PasswordInput name="confirm" label="Repetila" error={errors.confirm} autoComplete="new-password" />
            </>
          )}
          <div className={styles.actions}>
            <Button type="submit" variant={mode === "remove" ? "danger" : "primary"} loading={saving}>
              {mode === "remove" ? "Quitar contraseña" : "Guardar"}
            </Button>
            <Button variant="ghost" onClick={cancel} disabled={saving}>
              Cancelar
            </Button>
          </div>
        </form>
      )}
    </SettingsSection>
  );
}
