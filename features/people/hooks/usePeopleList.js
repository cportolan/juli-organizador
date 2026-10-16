"use client";

import { useCallback, useMemo } from "react";
import { useCollection } from "@/lib/hooks/useCollection";
import { useMutation } from "@/lib/hooks/useMutation";
import { createPerson, deletePerson, renamePerson, reorderPeople } from "./peopleService";

/** Fichas (pestañas) ordenadas por posición, con alta, renombre, orden y borrado. */
export function usePeopleList(initialPeople) {
  const people = useCollection(initialPeople, { prepend: false });
  const [runCreate, creating] = useMutation(createPerson, { successMessage: "Ficha creada" });
  const [runRename, renaming] = useMutation(renamePerson);
  const [runReorder] = useMutation(reorderPeople);
  const [runDelete, deleting] = useMutation(deletePerson, { successMessage: "Ficha borrada" });
  const { items, setItems, upsert, patch, remove } = people;

  const sorted = useMemo(() => items.toSorted((a, b) => a.position - b.position), [items]);

  const create = useCallback(
    async (name) => {
      const result = await runCreate({ name });
      if (result.ok) upsert(result.data);
      return result;
    },
    [runCreate, upsert],
  );

  const rename = useCallback(
    async (id, name) => {
      const result = await runRename({ id, name });
      if (result.ok) patch(id, { name: result.data.name });
      return result;
    },
    [runRename, patch],
  );

  /** Mueve una ficha a otra posición. Optimista: si falla, vuelve al orden anterior. */
  const move = useCallback(
    async (id, toIndex) => {
      const previous = sorted;
      const ids = previous.map((person) => person.id).filter((personId) => personId !== id);
      ids.splice(Math.max(0, Math.min(toIndex, ids.length)), 0, id);
      setItems(ids.map((personId, position) => ({ ...previous.find((person) => person.id === personId), position })));
      const result = await runReorder(ids);
      if (!result.ok) setItems(previous);
    },
    [sorted, setItems, runReorder],
  );

  const removePerson = useCallback(
    async (id) => {
      const result = await runDelete(id);
      if (result.ok) remove(id);
      return result;
    },
    [runDelete, remove],
  );

  return { people: sorted, create, rename, move, remove: removePerson, patch, creating, renaming, deleting };
}
