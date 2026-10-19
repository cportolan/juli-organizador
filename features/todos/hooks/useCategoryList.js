"use client";

import { useCallback, useMemo } from "react";
import { useCollection } from "@/lib/hooks/useCollection";
import { useMutation } from "@/lib/hooks/useMutation";
import { createCategory, deleteCategory, updateCategory } from "@/features/todos/actions";
import { sortCategories } from "../components/todoMeta";

/** Categorías de pendientes, ordenadas por nombre, con su CRUD. */
export function useCategoryList(initialCategories) {
  const categories = useCollection(initialCategories, { prepend: false });
  const [runCreate, creating] = useMutation(createCategory);
  const [runUpdate] = useMutation(updateCategory);
  const [runDelete] = useMutation(deleteCategory, { successMessage: "Categoría borrada" });
  const { upsert, remove } = categories;

  const sorted = useMemo(() => sortCategories(categories.items), [categories.items]);
  const byId = useMemo(() => new Map(categories.items.map((category) => [category.id, category])), [categories.items]);

  const create = useCallback(
    async (data) => {
      const result = await runCreate(data);
      if (result.ok) upsert(result.data);
      return result;
    },
    [runCreate, upsert],
  );

  const update = useCallback(
    async (id, data) => {
      const result = await runUpdate({ id, data });
      if (result.ok) upsert(result.data);
      return result;
    },
    [runUpdate, upsert],
  );

  const removeCategory = useCallback(
    async (id) => {
      const result = await runDelete(id);
      if (result.ok) remove(id);
      return result;
    },
    [runDelete, remove],
  );

  return { categories: sorted, byId, create, update, remove: removeCategory, creating };
}
