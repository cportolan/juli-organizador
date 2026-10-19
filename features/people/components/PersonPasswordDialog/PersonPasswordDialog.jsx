"use client";

import { useState } from "react";
import { useMutation } from "@/lib/hooks/useMutation";
import Modal from "@/components/ui/Modal/Modal";
import PasswordChangeForm from "@/components/ui/PasswordChangeForm/PasswordChangeForm";
import SegmentedControl from "@/components/ui/SegmentedControl/SegmentedControl";
import { setPersonPassword } from "../../hooks/peopleService";
import styles from "./PersonPasswordDialog.module.css";

const MODES = [
  { id: "change", label: "Cambiar" },
  { id: "remove", label: "Quitar" },
];

/** Poner, cambiar o quitar la contraseña propia de una ficha. */
export default function PersonPasswordDialog({ person, onClose, onChanged }) {
  return (
    <Modal
      open={person !== null}
      onClose={onClose}
      title={person?.hasPassword ? "Contraseña de la ficha" : "Poner contraseña a la ficha"}
      description={person ? `Se va a pedir cada vez que abras la ficha de ${person.name}.` : undefined}
      size="sm"
    >
      {person && <PersonPasswordForm key={person.id} person={person} onClose={onClose} onChanged={onChanged} />}
    </Modal>
  );
}

function PersonPasswordForm({ person, onClose, onChanged }) {
  const [mode, setMode] = useState(person.hasPassword ? "change" : "set");
  const [save, saving] = useMutation(setPersonPassword, {
    successMessage: mode === "remove" ? "Contraseña quitada" : "Contraseña guardada",
  });

  async function handleSubmit(passwords) {
    const result = await save({ id: person.id, ...passwords });
    if (result.ok) {
      onChanged(person.id, result.data.hasPassword);
      onClose();
    }
    return result;
  }

  return (
    <div className={styles.body}>
      {person.hasPassword && <SegmentedControl label="Acción" items={MODES} value={mode} onChange={setMode} size="sm" />}
      <PasswordChangeForm
        key={mode}
        mode={mode}
        username={person.name}
        minLength={1}
        loading={saving}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
