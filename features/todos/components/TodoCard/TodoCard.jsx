"use client";

import { cx } from "@/lib/utils/cx";
import Highlight from "@/components/ui/Highlight/Highlight";
import TodoStatusButton from "../TodoStatusButton/TodoStatusButton";
import TodoMeta from "../TodoMeta/TodoMeta";
import TodoActions from "../TodoActions/TodoActions";
import { otherStatus } from "../todoMeta";
import styles from "./TodoCard.module.css";

/**
 * Un pendiente. variant "card" (columnas) o "row" (lista).
 * Con `draggable` se puede arrastrar entre columnas.
 */
export default function TodoCard({
  todo,
  category,
  terms,
  variant = "card",
  draggable = false,
  onEdit,
  onStatus,
  onDelete,
  onDragStart,
}) {
  const done = todo.status === "done";

  return (
    <article
      className={cx(styles.todo, styles[variant], done && styles.done)}
      draggable={draggable || undefined}
      onDragStart={draggable ? (event) => onDragStart?.(event, todo) : undefined}
      aria-label={todo.title}
    >
      <TodoStatusButton todo={todo} onToggle={() => onStatus(todo, otherStatus(todo.status))} className={styles.status} />
      <div className={styles.body}>
        <button type="button" className={styles.title} onClick={() => onEdit(todo)}>
          <span className={styles.titleText}>
            <Highlight text={todo.title} terms={terms} />
          </span>
        </button>
        {todo.description && (
          <p className={styles.description}>
            <Highlight text={todo.description} terms={terms} />
          </p>
        )}
        <TodoMeta todo={todo} category={category} className={styles.meta} />
      </div>
      <TodoActions todo={todo} onEdit={onEdit} onStatus={onStatus} onDelete={onDelete} className={styles.actions} />
    </article>
  );
}
