"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { TONE_SWATCHES } from "@/lib/utils/tones";
import ColorSwatches from "@/components/ui/ColorSwatches/ColorSwatches";
import IconButton from "@/components/ui/IconButton/IconButton";
import styles from "./CategoryRow.module.css";

/** Una categoría editable en el lugar: nombre (se guarda al salir) y color. */
export default function CategoryRow({ category, count, onUpdate, onDelete }) {
  const [name, setName] = useState(category.name);
  const [picking, setPicking] = useState(false);

  async function commitName() {
    const trimmed = name.trim();
    if (!trimmed) {
      setName(category.name);
      return;
    }
    if (trimmed === category.name) return;
    const result = await onUpdate({ name: trimmed });
    if (!result.ok) setName(category.name);
  }

  return (
    <li className={styles.row}>
      <div className={styles.main}>
        <button
          type="button"
          className={styles.color}
          style={{ "--swatch": category.color }}
          onClick={() => setPicking((value) => !value)}
          aria-expanded={picking}
          aria-label={`Cambiar color de ${category.name}`}
        />
        <input
          className={styles.name}
          value={name}
          onChange={(event) => setName(event.target.value)}
          onBlur={commitName}
          onKeyDown={(event) => {
            if (event.key === "Enter") event.currentTarget.blur();
            if (event.key === "Escape") setName(category.name);
          }}
          aria-label="Nombre de la categoría"
          maxLength={40}
        />
        <span className={styles.count} title="Pendientes con esta categoría">
          {count}
        </span>
        <IconButton icon={Trash2} label="Borrar categoría" size="sm" onClick={onDelete} />
      </div>
      {picking && (
        <div className={styles.picker}>
          <ColorSwatches
            label={`Color de ${category.name}`}
            options={TONE_SWATCHES}
            value={category.color}
            onChange={(color) => onUpdate({ color })}
            size="sm"
          />
        </div>
      )}
    </li>
  );
}
