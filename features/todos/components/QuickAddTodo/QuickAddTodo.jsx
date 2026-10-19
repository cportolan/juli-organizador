"use client";

import { useRef, useState } from "react";
import { CornerDownLeft, Plus } from "lucide-react";
import { cx } from "@/lib/utils/cx";
import { useRovingFocus } from "@/lib/hooks/useRovingFocus";
import { NO_CATEGORY } from "../todoMeta";
import styles from "./QuickAddTodo.module.css";

/**
 * Anotar un pendiente rápido: escribir y Enter. Si hay categorías, antes de
 * crearlo se elige una (flechas + Enter, o click); Escape vuelve a editar.
 * `defaultCategoryId` es la que aparece marcada primero (por ejemplo, la del filtro).
 */
export default function QuickAddTodo({
  onAdd,
  categories = [],
  defaultCategoryId,
  placeholder = "Anotá un pendiente y apretá Enter",
}) {
  const [value, setValue] = useState("");
  const [busy, setBusy] = useState(false);
  const [picking, setPicking] = useState(false);
  const [activeId, setActiveId] = useState(null);
  const inputRef = useRef(null);
  const choices = [...categories, NO_CATEGORY];
  const handleChoicesKeyDown = useRovingFocus({ items: choices, value: activeId, onChange: setActiveId });

  async function add(categoryId) {
    const title = value.trim();
    if (!title || busy) return;
    setBusy(true);
    const result = await onAdd({ title, categoryId });
    setBusy(false);
    if (result.ok) {
      setValue("");
      setPicking(false);
    }
    inputRef.current?.focus();
  }

  function handleSubmit(event) {
    event.preventDefault();
    if (!value.trim() || busy) return;
    if (!categories.length) return add(null);
    const initial = choices.find((choice) => choice.id === defaultCategoryId) ?? choices[0];
    setActiveId(initial.id);
    setPicking(true);
    requestAnimationFrame(() => document.getElementById(`quick-add-choice-${initial.id}`)?.focus());
  }

  function backToEditing() {
    setPicking(false);
    inputRef.current?.focus();
  }

  return (
    <div className={styles.quickAdd} data-picking={picking}>
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
          onChange={(event) => {
            setValue(event.target.value);
            setPicking(false);
          }}
          onFocus={() => setPicking(false)}
          placeholder={placeholder}
          autoComplete="off"
          maxLength={200}
        />
        <kbd className={styles.hint} data-visible={Boolean(value.trim()) && !picking} aria-hidden>
          <CornerDownLeft />
        </kbd>
      </form>

      {picking && (
        <div
          className={styles.picker}
          role="group"
          aria-labelledby="quick-add-picker-label"
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              event.preventDefault();
              backToEditing();
            } else handleChoicesKeyDown(event);
          }}
        >
          <p id="quick-add-picker-label" className={styles.pickerLabel}>
            ¿En qué categoría?
            <span className={styles.pickerHint}>Flechas para elegir · Esc para volver</span>
          </p>
          <div className={styles.choices}>
            {choices.map((choice) => (
              <button
                key={choice.id}
                id={`quick-add-choice-${choice.id}`}
                type="button"
                className={cx(styles.choice, !choice.color && styles.uncategorized)}
                style={choice.color ? { "--tone": choice.color } : undefined}
                data-active={choice.id === activeId}
                tabIndex={choice.id === activeId ? 0 : -1}
                disabled={busy}
                onFocus={() => setActiveId(choice.id)}
                onClick={() => add(choice.id === NO_CATEGORY.id ? null : choice.id)}
              >
                <span className={styles.dot} aria-hidden />
                {choice.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
