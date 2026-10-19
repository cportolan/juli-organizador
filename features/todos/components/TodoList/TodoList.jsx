"use client";

import { ViewTransition } from "react";
import TodoCard from "../TodoCard/TodoCard";
import { groupByCategory } from "../todoMeta";
import styles from "./TodoList.module.css";

/** Vista de ítems: una lista compacta agrupada por categoría, con lo pendiente primero. */
export default function TodoList({ todos, categories, terms, onEdit, onStatus, onDelete }) {
  return (
    <div className={styles.list}>
      {groupByCategory(todos, categories).map(({ category, items }) => (
        <section key={category.id} className={styles.group} aria-labelledby={`todo-list-${category.id}`}>
          <h2
            id={`todo-list-${category.id}`}
            className={styles.heading}
            style={category.color ? { "--tone": category.color } : undefined}
          >
            <span className={styles.dot} aria-hidden />
            {category.name} <span className={styles.count}>{items.length}</span>
          </h2>
          <ul className={styles.items}>
            {items.map((todo) => (
              <ViewTransition key={todo.id} name={`todo-${todo.id}`}>
                <li>
                  <TodoCard
                    todo={todo}
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
      ))}
    </div>
  );
}
