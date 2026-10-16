"use client";

import { useRef, useState } from "react";
import { CornerDownLeft, Plus } from "lucide-react";
import styles from "./QuickAddTodo.module.css";

/** Anotar un pendiente rápido: escribir y Enter. */
export default function QuickAddTodo({ onAdd, placeholder = "Anotá un pendiente y apretá Enter" }) {
  const [value, setValue] = useState("");
  const [busy, setBusy] = useState(false);
  const inputRef = useRef(null);

  async function handleSubmit(event) {
    event.preventDefault();
    const title = value.trim();
    if (!title || busy) return;
    setBusy(true);
    const result = await onAdd({ title });
    setBusy(false);
    if (result.ok) setValue("");
    inputRef.current?.focus();
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit} data-busy={busy}>
      <Plus className={styles.icon} aria-hidden />
      <label className="visually-hidden" htmlFor="quick-add-todo">
        Nuevo pendiente
      </label>
      <input
        ref={inputRef}
        id="quick-add-todo"
        className={styles.input}
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder={placeholder}
        autoComplete="off"
        maxLength={200}
      />
      <kbd className={styles.hint} data-visible={Boolean(value.trim())} aria-hidden>
        <CornerDownLeft />
      </kbd>
    </form>
  );
}
