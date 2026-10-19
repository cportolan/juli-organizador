"use client";

import { useState, ViewTransition } from "react";
import { cx } from "@/lib/utils/cx";
import TodoCard from "../TodoCard/TodoCard";
import { groupByCategory, NO_CATEGORY } from "../todoMeta";
import styles from "./TodoColumns.module.css";

const DRAG_TYPE = "application/x-oj-todo";

/**
 * Vista kanban: una columna por categoría (y "Sin categoría").
 * Arrastrar un pendiente a otra columna le cambia la categoría.
 */
export default function TodoColumns({ todos, categories, terms, showEmpty, onEdit, onStatus, onCategory, onDelete }) {
  const [dropTarget, setDropTarget] = useState(null);
  const groups = groupByCategory(todos, categories, { includeEmpty: showEmpty });

  function handleDragStart(event, todo) {
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData(DRAG_TYPE, todo.id);
  }

  function handleDragOver(event, groupId) {
    if (!event.dataTransfer.types.includes(DRAG_TYPE)) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
    if (dropTarget !== groupId) setDropTarget(groupId);
  }

  function handleDragLeave(event) {
    if (!event.currentTarget.contains(event.relatedTarget)) setDropTarget(null);
  }

  function handleDrop(event, groupId) {
    event.preventDefault();
    setDropTarget(null);
    const todo = todos.find((item) => item.id === event.dataTransfer.getData(DRAG_TYPE));
    const categoryId = groupId === NO_CATEGORY.id ? null : groupId;
    if (todo && (todo.categoryId ?? null) !== categoryId) onCategory(todo, categoryId);
  }

  return (
    <div className={styles.columns}>
      {groups.map(({ category, items }) => {
        const pending = items.filter((todo) => todo.status !== "done").length;
        const headingId = `todo-column-${category.id}`;
        return (
          <section
            key={category.id}
            className={cx(styles.column, !category.color && styles.uncategorized, dropTarget === category.id && styles.dropping)}
            style={category.color ? { "--tone": category.color } : undefined}
            aria-labelledby={headingId}
            onDragOver={(event) => handleDragOver(event, category.id)}
            onDragLeave={handleDragLeave}
            onDrop={(event) => handleDrop(event, category.id)}
          >
            <header className={styles.header}>
              <span className={styles.dot} aria-hidden />
              <h2 id={headingId} className={styles.title}>
                {category.name}
              </h2>
              <span className={styles.count} title={`${pending} pendientes de ${items.length}`}>
                {pending}
                {pending !== items.length && <span className={styles.total}>/{items.length}</span>}
              </span>
            </header>
            <ul className={styles.list}>
              {items.map((todo) => (
                <ViewTransition key={todo.id} name={`todo-${todo.id}`}>
                  <li>
                    <TodoCard
                      todo={todo}
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
            {items.length === 0 && <p className={styles.empty}>Arrastrá acá un pendiente.</p>}
          </section>
        );
      })}
    </div>
  );
}
