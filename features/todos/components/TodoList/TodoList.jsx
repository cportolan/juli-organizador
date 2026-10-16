"use client";

import { ViewTransition } from "react";
import TodoCard from "../TodoCard/TodoCard";
import { STATUSES } from "../todoMeta";
import styles from "./TodoList.module.css";

/** Vista de ítems: una lista compacta, primero lo pendiente y abajo lo realizado. */
export default function TodoList({ todos, categoriesById, terms, onEdit, onStatus, onDelete }) {
  return (
    <div className={styles.list}>
      {STATUSES.map((status) => {
        const items = todos.filter((todo) => todo.status === status.id);
        if (!items.length) return null;
        return (
          <section key={status.id} className={styles.group} aria-labelledby={`todo-list-${status.id}`}>
            <h2 id={`todo-list-${status.id}`} className={styles.heading}>
              {status.plural} <span className={styles.count}>{items.length}</span>
            </h2>
            <ul className={styles.items}>
              {items.map((todo) => (
                <ViewTransition key={todo.id} name={`todo-${todo.id}`}>
                  <li>
                    <TodoCard
                      todo={todo}
                      category={categoriesById.get(todo.categoryId)}
                      terms={terms}
                      variant="row"
                      onEdit={onEdit}
                      onStatus={onStatus}
                      onDelete={onDelete}
                    />
                  </li>
                </ViewTransition>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
