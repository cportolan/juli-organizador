"use client";

import { useState } from "react";
import { Lock, Plus } from "lucide-react";
import { cx } from "@/lib/utils/cx";
import { useRovingFocus } from "@/lib/hooks/useRovingFocus";
import IconButton from "@/components/ui/IconButton/IconButton";
import styles from "./PeopleTabs.module.css";

const DRAG_TYPE = "application/x-oj-person";

/** Pestañas de fichas, estilo separadores de carpeta. Se reordenan arrastrando. */
export default function PeopleTabs({ people, activeId, onSelect, onAdd, onMove }) {
  const [dropIndex, setDropIndex] = useState(null);
  const onKeyDown = useRovingFocus({ items: people, value: activeId, onChange: onSelect });

  function handleDragOver(event, index) {
    if (!event.dataTransfer.types.includes(DRAG_TYPE)) return;
    event.preventDefault();
    const rect = event.currentTarget.getBoundingClientRect();
    const target = event.clientX > rect.left + rect.width / 2 ? index + 1 : index;
    if (target !== dropIndex) setDropIndex(target);
  }

  function handleDrop(event) {
    event.preventDefault();
    const id = event.dataTransfer.getData(DRAG_TYPE);
    const from = people.findIndex((person) => person.id === id);
    if (from !== -1 && dropIndex !== null) onMove(id, dropIndex > from ? dropIndex - 1 : dropIndex);
    setDropIndex(null);
  }

  return (
    <div className={styles.bar}>
      <div
        role="tablist"
        aria-label="Fichas"
        className={styles.tabs}
        onKeyDown={onKeyDown}
        onDrop={handleDrop}
        onDragLeave={(event) => !event.currentTarget.contains(event.relatedTarget) && setDropIndex(null)}
      >
        {people.map((person, index) => {
          const active = person.id === activeId;
          return (
            <button
              key={person.id}
              type="button"
              role="tab"
              id={`person-tab-${person.id}`}
              aria-selected={active}
              aria-controls="person-panel"
              tabIndex={active ? 0 : -1}
              data-active={active}
              className={cx(
                styles.tab,
                dropIndex === index && styles.dropBefore,
                dropIndex === index + 1 && index === people.length - 1 && styles.dropAfter,
              )}
              draggable
              onDragStart={(event) => {
                event.dataTransfer.effectAllowed = "move";
                event.dataTransfer.setData(DRAG_TYPE, person.id);
              }}
              onDragEnd={() => setDropIndex(null)}
              onDragOver={(event) => handleDragOver(event, index)}
              onClick={() => onSelect(person.id)}
            >
              <span className={styles.name}>{person.name}</span>
              {person.hasPassword && <Lock className={styles.lock} aria-label="con contraseña" />}
            </button>
          );
        })}
      </div>
      <IconButton icon={Plus} label="Nueva ficha" onClick={onAdd} className={styles.add} />
    </div>
  );
}
