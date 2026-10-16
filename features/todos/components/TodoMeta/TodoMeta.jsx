"use client";

import { Flag } from "lucide-react";
import { formatShortDate } from "@/lib/utils/dates";
import { useToday } from "@/lib/hooks/useToday";
import { cx } from "@/lib/utils/cx";
import Badge from "@/components/ui/Badge/Badge";
import { priorityMeta } from "../todoMeta";
import styles from "./TodoMeta.module.css";

/** Prioridad, categoría y fecha de creación de un pendiente. */
export default function TodoMeta({ todo, category, showDate = true, className }) {
  const today = useToday();
  const priority = priorityMeta(todo.priority);

  if (!priority && !category && !showDate) return null;

  return (
    <div className={cx(styles.meta, className)}>
      {priority && (
        <Badge tone={priority.tone} icon={Flag}>
          {priority.label}
        </Badge>
      )}
      {category && (
        <Badge color={category.color} dot>
          {category.name}
        </Badge>
      )}
      {showDate && (
        <time className={styles.date} dateTime={todo.createdAt} title="Fecha de creación">
          {formatShortDate(todo.createdAt, today)}
        </time>
      )}
    </div>
  );
}
