"use client";

import { ArrowLeft, ArrowRight, ListTodo } from "lucide-react";
import { useMemo, ViewTransition } from "react";
import { cx } from "@/lib/utils/cx";
import Button from "@/components/ui/Button/Button";
import EmptyState from "@/components/ui/EmptyState/EmptyState";
import { useTodoList } from "@/features/todos/hooks/useTodoList";
import QuickAddTodo from "@/features/todos/components/QuickAddTodo/QuickAddTodo";
import { priorityMeta } from "@/features/todos/components/todoMeta";
import styles from "./CalendarTodos.module.css";

const DONE_VISIBLE = 5;

/** Pendientes al costado del calendario: mismos datos que la sección, con flechas para cambiar el estado. */
export default function CalendarTodos({ initialTodos, categories }) {
  const { todos, create, setStatus } = useTodoList(initialTodos);
  const categoriesById = useMemo(() => new Map(categories.map((category) => [category.id, category])), [categories]);

  const pending = todos.filter((todo) => todo.status === "pending");
  const done = todos
    .filter((todo) => todo.status === "done")
    .toSorted((a, b) => (b.doneAt ?? "").localeCompare(a.doneAt ?? ""))
    .slice(0, DONE_VISIBLE);

  const renderItem = (todo) => {
    const category = categoriesById.get(todo.categoryId);
    const priority = priorityMeta(todo.priority);
    const isDone = todo.status === "done";
    return (
      <ViewTransition key={todo.id} name={`side-todo-${todo.id}`}>
        <li className={cx(styles.item, isDone && styles.done)}>
          <p className={styles.title}>{todo.title}</p>
          <div className={styles.meta}>
            {category && (
              <span className={styles.category} style={{ "--tone": category.color }}>
                {category.name}
              </span>
            )}
            {priority && <span className={styles.priority}>{priority.label}</span>}
            <button
              type="button"
              className={styles.move}
              onClick={() => setStatus(todo, isDone ? "pending" : "done")}
              aria-label={isDone ? `Volver “${todo.title}” a pendiente` : `Marcar “${todo.title}” como realizado`}
            >
              {isDone ? (
                <>
                  <ArrowLeft aria-hidden /> Pendiente
                </>
              ) : (
                <>
                  Realizado <ArrowRight aria-hidden />
                </>
              )}
            </button>
          </div>
        </li>
      </ViewTransition>
    );
  };

  return (
    <section className={styles.todos} aria-labelledby="calendar-todos-title">
      <header className={styles.header}>
        <h3 id="calendar-todos-title" className={styles.heading}>
          Pendientes <span className={styles.count}>{pending.length}</span>
        </h3>
        <Button href="/pendientes" variant="ghost" size="sm">
          Ver todos
        </Button>
      </header>
      <QuickAddTodo onAdd={create} placeholder="Anotar pendiente" />
      {pending.length === 0 ? (
        <EmptyState compact icon={ListTodo} title="Todo al día" description="Lo que anotes aparece acá y en Pendientes." />
      ) : (
        <ul className={styles.list}>{pending.map(renderItem)}</ul>
      )}
      {done.length > 0 && (
        <>
          <h4 className={styles.subheading}>Realizados hace poco</h4>
          <ul className={styles.list}>{done.map(renderItem)}</ul>
        </>
      )}
    </section>
  );
}
