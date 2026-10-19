"use client";

import { useId, useMemo } from "react";
import Button from "@/components/ui/Button/Button";
import Combobox from "@/components/ui/Combobox/Combobox";
import Input from "@/components/ui/Input/Input";
import Modal from "@/components/ui/Modal/Modal";
import styles from "./PhoneFormModal.module.css";

const FIELDS = [
  { name: "office", label: "Oficina", placeholder: "Compras", suggest: true },
  { name: "agent", label: "Agente", placeholder: "Marta Gómez" },
  { name: "phone", label: "Teléfono o interno", placeholder: "2140", inputMode: "tel" },
];

const collator = new Intl.Collator("es", { sensitivity: "base", numeric: true });

/** Valores distintos ya cargados en un campo, sin repetir por mayúsculas o espacios. */
function distinctValues(phones, name) {
  const byKey = new Map();
  for (const phone of phones) {
    const value = phone[name]?.trim();
    if (value && !byKey.has(value.toLowerCase())) byKey.set(value.toLowerCase(), value);
  }
  return [...byKey.values()].sort(collator.compare);
}

/**
 * Alta y edición de un interno. Ningún campo es obligatorio.
 * La oficina sugiere las ya cargadas para que se agrupen bien.
 */
export default function PhoneFormModal({ open, phone, phones, saving, onClose, onSave }) {
  const formId = useId();
  const offices = useMemo(() => distinctValues(phones, "office"), [phones]);

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
        {FIELDS.map(({ name, label, placeholder, inputMode, suggest }, index) => {
          const Control = suggest ? Combobox : Input;
          return (
            <Control
              key={name}
              {...(suggest && { options: offices })}
              name={name}
              label={label}
              placeholder={placeholder}
              inputMode={inputMode}
              defaultValue={phone?.[name] ?? ""}
              autoComplete="off"
              autoFocus={index === 0}
            />
          );
        })}
      </form>
    </Modal>
  );
}
