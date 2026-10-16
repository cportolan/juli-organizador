"use client";

import { useCallback, useState } from "react";

/**
 * Lista de registros con id que vino del servidor y que la UI mantiene
 * al día con lo que devuelven las Server Actions.
 * `prepend` decide si los nuevos van al principio o al final.
 */
export function useCollection(initialItems, { prepend = true } = {}) {
  const [items, setItems] = useState(initialItems);

  const upsert = useCallback(
    (item) =>
      setItems((current) => {
        if (current.some((entry) => entry.id === item.id)) {
          return current.map((entry) => (entry.id === item.id ? item : entry));
        }
        return prepend ? [item, ...current] : [...current, item];
      }),
    [prepend],
  );

  const patch = useCallback(
    (id, changes) => setItems((current) => current.map((entry) => (entry.id === id ? { ...entry, ...changes } : entry))),
    [],
  );

  const remove = useCallback((id) => setItems((current) => current.filter((entry) => entry.id !== id)), []);

  return { items, setItems, upsert, patch, remove };
}
