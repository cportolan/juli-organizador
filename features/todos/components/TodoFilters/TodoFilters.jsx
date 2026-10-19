"use client";

import { X } from "lucide-react";
import Button from "@/components/ui/Button/Button";
import Select from "@/components/ui/Select/Select";
import { CREATED_RANGES, NONE } from "../../hooks/useTodoFilters";
import { PRIORITIES, STATUSES } from "../todoMeta";
import styles from "./TodoFilters.module.css";

/** Filtros básicos: estado, prioridad, categoría y fecha de creación. */
export default function TodoFilters({ filters, setFilter, categories, activeCount, onClear }) {
  const selects = [
    {
      key: "status",
      label: "Estado",
      placeholder: "Cualquier estado",
      options: STATUSES.map(({ id, label }) => ({ value: id, label })),
    },
    {
      key: "priority",
      label: "Prioridad",
      placeholder: "Cualquier prioridad",
      options: [...PRIORITIES.map(({ id, label }) => ({ value: id, label })), { value: NONE, label: "Sin prioridad" }],
    },
    {
      key: "categoryId",
      label: "Categoría",
      placeholder: "Todas las categorías",
      options: [
        ...categories.map((category) => ({ value: category.id, label: category.name })),
        { value: NONE, label: "Sin categoría" },
      ],
    },
    {
      key: "created",
      label: "Creación",
      placeholder: "Cualquier fecha",
      options: CREATED_RANGES.map(({ value, label }) => ({ value, label })),
    },
  ];

  return (
    <div className={styles.filters} role="group" aria-label="Filtros">
      {selects.map(({ key, label, placeholder, options }) => (
        <Select
          key={key}
          aria-label={label}
          placeholder={placeholder}
          options={options}
          value={filters[key]}
          onChange={(event) => setFilter(key, event.target.value)}
          className={styles.select}
          data-active={Boolean(filters[key])}
        />
      ))}
      {activeCount > 0 && (
        <Button variant="ghost" size="sm" icon={X} onClick={onClear} className={styles.clear}>
          Limpiar
        </Button>
      )}
    </div>
  );
}
