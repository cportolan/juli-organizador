"use client";

import { useState, ViewTransition } from "react";
import { cx } from "@/lib/utils/cx";
import TodoCard from "../TodoCard/TodoCard";
import { STATUSES } from "../todoMeta";
import styles from "./TodoColumns.module.css";

const DRAG_TYPE = "application/x-oj-todo";

/** Vista kanban: Pendiente / Realizado. Se puede arrastrar entre columnas. */
export default function TodoColumns({ todos, categoriesById, terms, onEdit, onStatus, onDelete, emptyHint }) {
  const [dropTarget, setDropTarget] = useState(null);

  function handleDragStart(event, todo) {
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData(DRAG_TYPE, todo.id);
  }

  function handleDragOver(event, status) {
    if (!event.dataTransfer.types.includes(DRAG_TYPE)) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
    if (dropTarget !== status) setDropTarget(status);
  }

  function handleDragLeave(event) {
    if (!event.currentTarget.contains(event.relatedTarget)) setDropTarget(null);
  }

  function handleDrop(event, status) {
    event.preventDefault();
    setDropTarget(null);
    const todo = todos.find((item) => item.id === event.dataTransfer.getData(DRAG_TYPE));
    if (todo) onStatus(todo, status);
  }

  return (
    <div className={styles.columns}>
      {STATUSES.map((status) => {
        const items = todos.filter((todo) => todo.status === status.id);
        return (
          <section
            key={status.id}
            className={cx(styles.column, styles[status.id], dropTarget === status.id && styles.dropping)}
            aria-labelledby={`todo-column-${status.id}`}
            onDragOver={(event) => handleDragOver(event, status.id)}
            onDragLeave={handleDragLeave}
            onDrop={(event) => handleDrop(event, status.id)}
          >
            <header className={styles.header}>
              <status.icon className={styles.icon} aria-hidden />
              <h2 id={`todo-column-${status.id}`} className={styles.title}>
                {status.plural}
              </h2>
              <span className={styles.count}>{items.length}</span>
            </header>
            <ul className={styles.list}>
              {items.map((todo) => (
                <ViewTransition key={todo.id} name={`todo-${todo.id}`}>
                  <li>
                    <TodoCard
                      todo={todo}
                      category={categoriesById.get(todo.categoryId)}
                      terms={terms}
                      draggable
                      onDragStart={handleDragStart}
                      onEdit={onEdit}
                      onStatus={onStatus}
                      onDelete={onDelete}
                    />
                  </li>
                </ViewTransition>
              ))}
            </ul>
            {items.length === 0 && (
              <p className={styles.empty}>{status.id === "pending" ? emptyHint.pending : emptyHint.done}</p>
            )}
          </section>
        );
      })}
    </div>
  );
}
