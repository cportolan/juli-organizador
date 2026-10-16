"use client";

import { useMemo, useState } from "react";
import { ArrowDown, ArrowUp, Flag } from "lucide-react";
import { formatShortDate } from "@/lib/utils/dates";
import { useToday } from "@/lib/hooks/useToday";
import { cx } from "@/lib/utils/cx";
import Badge from "@/components/ui/Badge/Badge";
import Highlight from "@/components/ui/Highlight/Highlight";
import TodoStatusButton from "../TodoStatusButton/TodoStatusButton";
import TodoActions from "../TodoActions/TodoActions";
import { otherStatus, priorityMeta } from "../todoMeta";
import styles from "./TodoTable.module.css";

const collator = new Intl.Collator("es", { sensitivity: "base", numeric: true });

const COLUMNS = [
  { id: "title", label: "Título", compare: (a, b) => collator.compare(a.title, b.title) },
  {
    id: "category",
    label: "Categoría",
    compare: (a, b, categories) =>
      collator.compare(categories.get(a.categoryId)?.name ?? "~", categories.get(b.categoryId)?.name ?? "~"),
  },
  {
    id: "priority",
    label: "Prioridad",
    compare: (a, b) => (priorityMeta(b.priority)?.rank ?? 0) - (priorityMeta(a.priority)?.rank ?? 0),
  },
  { id: "createdAt", label: "Creado", compare: (a, b) => b.createdAt.localeCompare(a.createdAt) },
];

/** Vista de tabla, ordenable por columna. */
export default function TodoTable({ todos, categoriesById, terms, onEdit, onStatus, onDelete }) {
  const today = useToday();
  const [sort, setSort] = useState({ column: "createdAt", reverse: false });

  const sorted = useMemo(() => {
    const column = COLUMNS.find((item) => item.id === sort.column);
    const items = todos.toSorted((a, b) => column.compare(a, b, categoriesById));
    return sort.reverse ? items.reverse() : items;
  }, [todos, sort, categoriesById]);

  function toggleSort(column) {
    setSort((current) => ({ column, reverse: current.column === column ? !current.reverse : false }));
  }

  return (
    <div className={styles.wrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th scope="col" className={styles.statusCell}>
              <span className="visually-hidden">Estado</span>
            </th>
            {COLUMNS.map((column) => {
              const active = sort.column === column.id;
              const SortIcon = sort.reverse ? ArrowUp : ArrowDown;
              return (
                <th
                  key={column.id}
                  scope="col"
                  className={styles[`${column.id}Cell`]}
                  aria-sort={active ? (sort.reverse ? "ascending" : "descending") : undefined}
                >
                  <button
                    type="button"
                    className={cx(styles.sort, active && styles.sortActive)}
                    onClick={() => toggleSort(column.id)}
                  >
                    {column.label}
                    <SortIcon className={styles.sortIcon} aria-hidden />
                  </button>
                </th>
              );
            })}
            <th scope="col" className={styles.actionsCell}>
              <span className="visually-hidden">Acciones</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((todo) => {
            const category = categoriesById.get(todo.categoryId);
            const priority = priorityMeta(todo.priority);
            return (
              <tr key={todo.id} className={cx(styles.row, todo.status === "done" && styles.done)}>
                <td className={styles.statusCell}>
                  <TodoStatusButton todo={todo} onToggle={() => onStatus(todo, otherStatus(todo.status))} />
                </td>
                <td className={styles.titleCell}>
                  <button type="button" className={styles.title} onClick={() => onEdit(todo)}>
                    <Highlight text={todo.title} terms={terms} />
                  </button>
                  {todo.description && (
                    <p className={styles.description}>
                      <Highlight text={todo.description} terms={terms} />
                    </p>
                  )}
                </td>
                <td className={styles.categoryCell}>
                  {category ? (
                    <Badge color={category.color} dot>
                      {category.name}
                    </Badge>
                  ) : (
                    <span className={styles.missing}>—</span>
                  )}
                </td>
                <td className={styles.priorityCell}>
                  {priority ? (
                    <Badge tone={priority.tone} icon={Flag}>
                      {priority.label}
                    </Badge>
                  ) : (
                    <span className={styles.missing}>—</span>
                  )}
                </td>
                <td className={styles.createdAtCell}>
                  <time dateTime={todo.createdAt}>{formatShortDate(todo.createdAt, today)}</time>
                </td>
                <td className={styles.actionsCell}>
                  <TodoActions todo={todo} onEdit={onEdit} onStatus={onStatus} onDelete={onDelete} />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
