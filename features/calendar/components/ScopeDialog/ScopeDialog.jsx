"use client";

import { useState } from "react";
import Button from "@/components/ui/Button/Button";
import Modal from "@/components/ui/Modal/Modal";
import styles from "./ScopeDialog.module.css";

const SCOPES = [
  { id: "this", label: "Solo este evento" },
  { id: "following", label: "Este y los siguientes" },
  { id: "all", label: "Todos los eventos" },
];

/** Pregunta a qué repeticiones aplicar una edición o un borrado. */
export default function ScopeDialog({ request, loading, onCancel, onConfirm }) {
  return (
    <Modal
      open={request !== null}
      onClose={onCancel}
      title={request?.kind === "delete" ? "Borrar evento que se repite" : "Editar evento que se repite"}
      size="sm"
    >
      {request && <ScopeForm key={request.kind} request={request} loading={loading} onCancel={onCancel} onConfirm={onConfirm} />}
    </Modal>
  );
}

function ScopeForm({ request, loading, onCancel, onConfirm }) {
  const options = SCOPES.filter((scope) => request.allowThis || scope.id !== "this");
  const [scope, setScope] = useState(options[0].id);
  const isDelete = request.kind === "delete";

  return (
    <form
      className={styles.form}
      onSubmit={(event) => {
        event.preventDefault();
        onConfirm(scope);
      }}
    >
      <div className={styles.options} role="radiogroup" aria-label="Alcance">
        {options.map((option) => (
          <label key={option.id} className={styles.option}>
            <input
              type="radio"
              name="scope"
              value={option.id}
              checked={scope === option.id}
              onChange={() => setScope(option.id)}
              className={styles.radio}
            />
            {option.label}
          </label>
        ))}
      </div>
      <div className={styles.actions}>
        <Button variant="ghost" onClick={onCancel} disabled={loading}>
          Cancelar
        </Button>
        <Button type="submit" variant={isDelete ? "danger" : "primary"} loading={loading} autoFocus>
          {isDelete ? "Borrar" : "Guardar"}
        </Button>
      </div>
    </form>
  );
}
