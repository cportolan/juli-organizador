"use client";

import { ChevronLeft, ChevronRight, ListTodo } from "lucide-react";
import { useMemo, useState, ViewTransition } from "react";
import { cx } from "@/lib/utils/cx";
import EmptyState from "@/components/ui/EmptyState/EmptyState";
import IconButton from "@/components/ui/IconButton/IconButton";
import { useTodoList } from "@/features/todos/hooks/useTodoList";
import QuickAddTodo from "@/features/todos/components/QuickAddTodo/QuickAddTodo";
import TodoStatusButton from "@/features/todos/components/TodoStatusButton/TodoStatusButton";
import { groupByCategory, NO_CATEGORY, priorityMeta, sortCategories } from "@/features/todos/components/todoMeta";
import styles from "./CalendarTodos.module.css";

const DONE_VISIBLE = 5;

const pendingCount = (group) => group.items.filter((todo) => todo.status === "pending").length;

/**
 * Pendientes al costado del calendario (mismos datos que la sección), de a una
 * categoría por vez: las flechas pasan a la anterior o la siguiente. Las
 * categorías van de la que más pendientes tiene a la que menos, y arranca
 * mostrando la primera.
 */
export default function CalendarTodos({ initialTodos, categories }) {
  const { todos, create, setStatus } = useTodoList(initialTodos);
  const [currentId, setCurrentId] = useState(null);
  const [direction, setDirection] = useState("next");

  const groups = useMemo(
    () =>
      // toSorted es estable: a igual cantidad queda el orden alfabético.
      groupByCategory(todos, sortCategories(categories), { includeEmpty: true }).toSorted(
        (a, b) => pendingCount(b) - pendingCount(a),
      ),
    [todos, categories],
  );
  const index = Math.max(
    0,
    groups.findIndex((group) => group.category.id === currentId),
  );
  const current = groups[index];
  const category = current?.category ?? NO_CATEGORY;
  const items = current?.items ?? [];
  const pending = items.filter((todo) => todo.status === "pending");
  const done = items
    .filter((todo) => todo.status === "done")
    .toSorted((a, b) => (b.doneAt ?? "").localeCompare(a.doneAt ?? ""))
    .slice(0, DONE_VISIBLE);

  function step(amount) {
    const next = groups[(index + amount + groups.length) % groups.length];
    setDirection(amount > 0 ? "next" : "prev");
    setCurrentId(next.category.id);
  }

  // Lo que se anota acá va a la categoría que se está viendo.
  const add = (data) => create({ ...data, categoryId: category === NO_CATEGORY ? null : category.id });

  const renderItem = (todo) => {
    const priority = priorityMeta(todo.priority);
    return (
      <ViewTransition key={todo.id} name={`side-todo-${todo.id}`}>
        <li className={cx(styles.item, todo.status === "done" && styles.done)}>
          <TodoStatusButton
            todo={todo}
            onToggle={() => setStatus(todo, todo.status === "done" ? "pending" : "done")}
            className={styles.status}
          />
          <div className={styles.body}>
            <p className={styles.title}>{todo.title}</p>
            {priority && <span className={styles.priority}>{priority.label}</span>}
          </div>
        </li>
      </ViewTransition>
    );
  };

  const prev = groups[(index - 1 + groups.length) % groups.length]?.category;
  const next = groups[(index + 1) % groups.length]?.category;

  return (
    <section className={styles.todos} aria-labelledby="calendar-todos-category">
      <header className={styles.pager} style={category.color ? { "--tone": category.color } : undefined}>
        {groups.length > 1 && (
          <IconButton icon={ChevronLeft} label={`Ver ${prev.name}`} size="sm" onClick={() => step(-1)} />
        )}
        <h3 id="calendar-todos-category" className={styles.category} aria-live="polite">
          <span className={cx(styles.dot, !category.color && styles.noColor)} aria-hidden />
          <span className={styles.categoryName}>{category.name}</span>
          <span className={styles.count}>{pending.length}</span>
        </h3>
        {groups.length > 1 && (
          <IconButton icon={ChevronRight} label={`Ver ${next.name}`} size="sm" onClick={() => step(1)} />
        )}
      </header>
      {groups.length > 1 && (
        <div className={styles.dots} aria-hidden>
          {groups.map((group, position) => (
            <span key={group.category.id} data-active={position === index} />
          ))}
        </div>
      )}

      <QuickAddTodo onAdd={add} placeholder={`Anotar en ${category.name}`} />

      <div key={category.id} className={styles.page} data-direction={direction}>
        {pending.length === 0 ? (
          <EmptyState compact icon={ListTodo} title="Nada por acá" description="Anotá arriba o pasá a otra categoría." />
        ) : (
          <ul className={styles.list}>{pending.map(renderItem)}</ul>
        )}
        {done.length > 0 && (
          <>
            <h4 className={styles.subheading}>Realizados hace poco</h4>
            <ul className={styles.list}>{done.map(renderItem)}</ul>
          </>
        )}
      </div>
    </section>
  );
}
