"use client";

import { useState } from "react";
import { KeyRound, LockKeyhole, LockKeyholeOpen } from "lucide-react";
import { useMutation } from "@/lib/hooks/useMutation";
import { setPeoplePassword } from "@/features/settings/actions";
import Button from "@/components/ui/Button/Button";
import PasswordChangeForm from "@/components/ui/PasswordChangeForm/PasswordChangeForm";
import SettingsSection from "../SettingsSection/SettingsSection";
import styles from "./PeoplePasswordSettings.module.css";

const MESSAGES = {
  set: "Contraseña activada",
  change: "Contraseña cambiada",
  remove: "Contraseña quitada",
};

/** Contraseña general para entrar a Usuarios: activar, cambiar o quitar. */
export default function PeoplePasswordSettings({ initialEnabled }) {
  const [enabled, setEnabled] = useState(initialEnabled);
  const [mode, setMode] = useState(null); // null | "set" | "change" | "remove"
  const [save, saving] = useMutation(setPeoplePassword, { successMessage: mode ? MESSAGES[mode] : undefined });

  async function handleSubmit(passwords) {
    const result = await save(passwords);
    if (result.ok) {
      setEnabled(result.data.peopleLockEnabled);
      setMode(null);
    }
    return result;
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
        <PasswordChangeForm
          key={mode}
          mode={mode}
          username="usuarios"
          loading={saving}
          onSubmit={handleSubmit}
          onCancel={() => setMode(null)}
        />
      )}
    </SettingsSection>
  );
}
