import { CircleCheck, CircleDashed } from "lucide-react";

export const STATUSES = [
  { id: "pending", label: "Pendiente", plural: "Pendientes", icon: CircleDashed },
  { id: "done", label: "Realizado", plural: "Realizados", icon: CircleCheck },
];

export const PRIORITIES = [
  { id: "high", label: "Alta", tone: "rose", rank: 3 },
  { id: "medium", label: "Media", tone: "butter", rank: 2 },
  { id: "low", label: "Baja", tone: "sky", rank: 1 },
];

export const DEFAULT_CATEGORY_COLOR = "#f0b6c8";

export function priorityMeta(id) {
  return PRIORITIES.find((priority) => priority.id === id) ?? null;
}

export function statusMeta(id) {
  return STATUSES.find((status) => status.id === id) ?? STATUSES[0];
}

export function otherStatus(status) {
  return status === "done" ? "pending" : "done";
}

/** Grupo para los pendientes que no tienen categoría. */
export const NO_CATEGORY = { id: "none", name: "Sin categoría", color: null };

/**
 * Agrupa los pendientes por categoría, en el orden de `categories`, con
 * "Sin categoría" al final. Dentro de cada grupo va primero lo pendiente.
 * Con `includeEmpty` también devuelve las categorías sin pendientes.
 */
export function groupByCategory(todos, categories, { includeEmpty = false } = {}) {
  const buckets = new Map([...categories, NO_CATEGORY].map((category) => [category.id, []]));
  for (const todo of todos) (buckets.get(todo.categoryId) ?? buckets.get(NO_CATEGORY.id)).push(todo);

  return [...categories, NO_CATEGORY]
    .map((category) => ({
      category,
      items: buckets.get(category.id).toSorted((a, b) => (a.status === b.status ? 0 : a.status === "done" ? 1 : -1)),
    }))
    .filter(({ category, items }) => items.length > 0 || (includeEmpty && category !== NO_CATEGORY));
}
