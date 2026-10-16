"use client";

import { useId, useState } from "react";
import Button from "@/components/ui/Button/Button";
import Input from "@/components/ui/Input/Input";
import Modal from "@/components/ui/Modal/Modal";

/** Diálogo con un solo campo de texto (crear o renombrar algo). */
export default function PromptDialog({
  open,
  onClose,
  onSubmit,
  title,
  label,
  placeholder,
  initialValue = "",
  confirmLabel = "Guardar",
  loading = false,
  maxLength = 80,
}) {
  const formId = useId();

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      size="sm"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button variant="primary" type="submit" form={formId} loading={loading}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      {open && (
        <PromptForm
          key={initialValue}
          id={formId}
          label={label}
          placeholder={placeholder}
          initialValue={initialValue}
          maxLength={maxLength}
          onSubmit={onSubmit}
        />
      )}
    </Modal>
  );
}

function PromptForm({ id, label, placeholder, initialValue, maxLength, onSubmit }) {
  const [value, setValue] = useState(initialValue);
  const [error, setError] = useState(null);

  return (
    <form
      id={id}
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        if (!value.trim()) return setError("No puede quedar vacío.");
        onSubmit(value.trim());
      }}
    >
      <Input
        label={label}
        value={value}
        onChange={(event) => {
          setValue(event.target.value);
          setError(null);
        }}
        placeholder={placeholder}
        error={error}
        maxLength={maxLength}
        autoComplete="off"
      />
    </form>
  );
}
