"use client";

import { startTransition, useCallback } from "react";
import { useCollection } from "@/lib/hooks/useCollection";
import { useMutation } from "@/lib/hooks/useMutation";
import { createTodo, deleteTodo, setTodoStatus, updateTodo } from "@/features/todos/actions";

/**
 * Estado de los pendientes y sus mutaciones. Lo comparten la sección
 * Pendientes y el panel del calendario.
 * Cambiar el estado es optimista: se ve al instante y se revierte si falla.
 */
export function useTodoList(initialTodos) {
  const todos = useCollection(initialTodos);
  const [runCreate, creating] = useMutation(createTodo);
  const [runUpdate, updating] = useMutation(updateTodo, { successMessage: "Cambios guardados" });
  const [runDelete, deleting] = useMutation(deleteTodo);
  const [runStatus] = useMutation(setTodoStatus);
  const [runMove] = useMutation(updateTodo);
  const { upsert, patch, remove, setItems } = todos;

  const create = useCallback(
    async (data) => {
      const result = await runCreate(data);
      if (result.ok) startTransition(() => upsert(result.data));
      return result;
    },
    [runCreate, upsert],
  );

  const update = useCallback(
    async (id, data) => {
      const result = await runUpdate({ id, data });
      if (result.ok) startTransition(() => upsert(result.data));
      return result;
    },
    [runUpdate, upsert],
  );

  const removeTodo = useCallback(
    async (id) => {
      const result = await runDelete(id);
      if (result.ok) startTransition(() => remove(id));
      return result;
    },
    [runDelete, remove],
  );

  const setStatus = useCallback(
    async (todo, status) => {
      if (todo.status === status) return { ok: true, data: todo };
      const previous = { status: todo.status, doneAt: todo.doneAt };
      // Urgente, fuera de startTransition: Next despacha la Server Action en una
      // transición que queda suspendida hasta que responde, y React agrupa las
      // transiciones, así que el tilde no se vería hasta tener la respuesta.
      patch(todo.id, { status, doneAt: status === "done" ? new Date().toISOString() : null });
      const result = await runStatus({ id: todo.id, status });
      startTransition(() => (result.ok ? upsert(result.data) : patch(todo.id, previous)));
      return result;
    },
    [runStatus, patch, upsert],
  );

  /** Mover a otra categoría (al arrastrar en el kanban), también optimista. */
  const setCategory = useCallback(
    async (todo, categoryId) => {
      const previous = todo.categoryId ?? null;
      patch(todo.id, { categoryId });
      const result = await runMove({ id: todo.id, data: { categoryId } });
      startTransition(() => (result.ok ? upsert(result.data) : patch(todo.id, { categoryId: previous })));
      return result;
    },
    [runMove, patch, upsert],
  );

  /** Al borrar una categoría, sus pendientes quedan sin categoría (igual que en la base). */
  const clearCategory = useCallback(
    (categoryId) =>
      setItems((current) =>
        current.map((todo) => (todo.categoryId === categoryId ? { ...todo, categoryId: null } : todo)),
      ),
    [setItems],
  );

  return {
    todos: todos.items,
    create,
    update,
    remove: removeTodo,
    setStatus,
    setCategory,
    clearCategory,
    saving: creating || updating,
    deleting,
  };
}
