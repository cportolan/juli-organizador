"use client";

import { useId, useState } from "react";
import Button from "@/components/ui/Button/Button";
import Input from "@/components/ui/Input/Input";
import Modal from "@/components/ui/Modal/Modal";
import SegmentedControl from "@/components/ui/SegmentedControl/SegmentedControl";
import Select from "@/components/ui/Select/Select";
import Textarea from "@/components/ui/Textarea/Textarea";
import { PRIORITIES, STATUSES } from "../todoMeta";
import styles from "./TodoFormModal.module.css";

const PRIORITY_ITEMS = [{ id: "", label: "Sin" }, ...PRIORITIES.toReversed().map(({ id, label }) => ({ id, label }))];
const STATUS_ITEMS = STATUSES.map(({ id, label, icon }) => ({ id, label, icon }));

/** Alta y edición de un pendiente. */
export default function TodoFormModal({ open, todo, categories, saving, onClose, onSave }) {
  const formId = useId();

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={todo ? "Editar pendiente" : "Nuevo pendiente"}
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={saving}>
            Cancelar
          </Button>
          <Button variant="primary" type="submit" form={formId} loading={saving}>
            {todo ? "Guardar" : "Agregar"}
          </Button>
        </>
      }
    >
      {open && <TodoForm key={todo?.id ?? "new"} id={formId} todo={todo} categories={categories} onSave={onSave} />}
    </Modal>
  );
}

function TodoForm({ id, todo, categories, onSave }) {
  const [priority, setPriority] = useState(todo?.priority ?? "");
  const [status, setStatus] = useState(todo?.status ?? "pending");
  const [error, setError] = useState(null);

  function handleSubmit(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const title = String(form.get("title")).trim();
    if (!title) {
      setError("Escribí un título.");
      return;
    }
    onSave({
      title,
      description: String(form.get("description")).trim() || null,
      categoryId: form.get("categoryId") || null,
      priority: priority || null,
      status,
    });
  }

  return (
    <form id={id} className={styles.form} onSubmit={handleSubmit} noValidate>
      <Input
        name="title"
        label="Título"
        defaultValue={todo?.title ?? ""}
        placeholder="Llamar a mantenimiento"
        error={error}
        onChange={() => error && setError(null)}
        autoComplete="off"
        autoFocus
      />
      <Textarea
        name="description"
        label="Descripción"
        optional
        rows={3}
        defaultValue={todo?.description ?? ""}
        placeholder="Detalles, a quién, para cuándo…"
      />
      <div className={styles.row}>
        <Select
          name="categoryId"
          label="Categoría"
          optional
          placeholder="Sin categoría"
          defaultValue={todo?.categoryId ?? ""}
          options={categories.map((category) => ({ value: category.id, label: category.name }))}
          className={styles.category}
        />
        <fieldset className={styles.fieldset}>
          <legend className={styles.legend}>Prioridad</legend>
          <SegmentedControl label="Prioridad" items={PRIORITY_ITEMS} value={priority} onChange={setPriority} size="sm" />
        </fieldset>
      </div>
      {todo && (
        <fieldset className={styles.fieldset}>
          <legend className={styles.legend}>Estado</legend>
          <SegmentedControl label="Estado" items={STATUS_ITEMS} value={status} onChange={setStatus} size="sm" />
        </fieldset>
      )}
    </form>
  );
}
