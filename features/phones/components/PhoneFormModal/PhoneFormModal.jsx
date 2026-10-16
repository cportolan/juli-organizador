"use client";

import { useId } from "react";
import Button from "@/components/ui/Button/Button";
import Input from "@/components/ui/Input/Input";
import Modal from "@/components/ui/Modal/Modal";
import styles from "./PhoneFormModal.module.css";

const FIELDS = [
  { name: "office", label: "Oficina", placeholder: "Compras" },
  { name: "agent", label: "Agente", placeholder: "Marta Gómez" },
  { name: "phone", label: "Teléfono o interno", placeholder: "2140", inputMode: "tel" },
];

/** Alta y edición de un interno. Ningún campo es obligatorio. */
export default function PhoneFormModal({ open, phone, saving, onClose, onSave }) {
  const formId = useId();

  function handleSubmit(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    onSave(Object.fromEntries(FIELDS.map(({ name }) => [name, form.get(name)])));
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={phone ? "Editar interno" : "Nuevo interno"}
      description="Completá lo que sepas; podés dejar campos vacíos."
      size="sm"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={saving}>
            Cancelar
          </Button>
          <Button variant="primary" type="submit" form={formId} loading={saving}>
            {phone ? "Guardar" : "Agregar"}
          </Button>
        </>
      }
    >
      {/* La key reinicia el formulario cada vez que se abre con otro interno */}
      <form key={open ? (phone?.id ?? "new") : "closed"} id={formId} className={styles.form} onSubmit={handleSubmit}>
        {FIELDS.map(({ name, label, placeholder, inputMode }, index) => (
          <Input
            key={name}
            name={name}
            label={label}
            placeholder={placeholder}
            inputMode={inputMode}
            defaultValue={phone?.[name] ?? ""}
            autoComplete="off"
            autoFocus={index === 0}
          />
        ))}
      </form>
    </Modal>
  );
}
