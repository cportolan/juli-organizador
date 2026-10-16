"use client";

import { useDeferredValue, useMemo, useState } from "react";
import { matchesSearch, searchTerms } from "@/lib/utils/search";
import { daysBetweenKeys, toDateKey } from "@/lib/utils/dates";
import { useToday } from "@/lib/hooks/useToday";

export const EMPTY_FILTERS = { status: "", priority: "", categoryId: "", created: "" };

export const CREATED_RANGES = [
  { value: "today", label: "Hoy", days: 0 },
  { value: "week", label: "Últimos 7 días", days: 6 },
  { value: "month", label: "Últimos 30 días", days: 29 },
];

/** Valor especial del filtro de categoría y prioridad: "sin asignar". */
export const NONE = "none";

function matchesFilters(todo, filters, today) {
  if (filters.status && todo.status !== filters.status) return false;
  if (filters.priority && (todo.priority ?? NONE) !== filters.priority) return false;
  if (filters.categoryId && (todo.categoryId ?? NONE) !== filters.categoryId) return false;
  if (filters.created && today) {
    const range = CREATED_RANGES.find((item) => item.value === filters.created);
    if (range && daysBetweenKeys(toDateKey(todo.createdAt), today) > range.days) return false;
  }
  return true;
}

/** Búsqueda general y filtros básicos sobre la lista de pendientes. */
export function useTodoFilters(todos, categoriesById) {
  const today = useToday();
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const deferredQuery = useDeferredValue(query);
  const terms = useMemo(() => searchTerms(deferredQuery), [deferredQuery]);

  const visible = useMemo(
    () =>
      todos.filter(
        (todo) =>
          matchesFilters(todo, filters, today) &&
          matchesSearch([todo.title, todo.description, categoriesById.get(todo.categoryId)?.name], terms),
      ),
    [todos, filters, today, terms, categoriesById],
  );

  const activeCount = Object.values(filters).filter(Boolean).length;

  return {
    query,
    setQuery,
    terms,
    filters,
    setFilter: (key, value) => setFilters((current) => ({ ...current, [key]: value })),
    clear: () => {
      setFilters(EMPTY_FILTERS);
      setQuery("");
    },
    activeCount,
    isFiltering: activeCount > 0 || terms.length > 0,
    visible,
  };
}
