"use client";

import { useMemo, useState } from "react";
import { Columns3, List, ListTodo, Plus, SearchX, Table2, Tags } from "lucide-react";
import { useStoredState } from "@/lib/hooks/useStoredState";
import { useToast } from "@/components/ui/Toast/Toast";
import Button from "@/components/ui/Button/Button";
import ConfirmDialog from "@/components/ui/ConfirmDialog/ConfirmDialog";
import EmptyState from "@/components/ui/EmptyState/EmptyState";
import SearchBar from "@/components/ui/SearchBar/SearchBar";
import SegmentedControl from "@/components/ui/SegmentedControl/SegmentedControl";
import { useTodoList } from "../../hooks/useTodoList";
import { useCategoryList } from "../../hooks/useCategoryList";
import { useTodoFilters } from "../../hooks/useTodoFilters";
import QuickAddTodo from "../QuickAddTodo/QuickAddTodo";
import TodoFilters from "../TodoFilters/TodoFilters";
import TodoColumns from "../TodoColumns/TodoColumns";
import TodoTable from "../TodoTable/TodoTable";
import TodoList from "../TodoList/TodoList";
import TodoFormModal from "../TodoFormModal/TodoFormModal";
import CategoryManager from "../CategoryManager/CategoryManager";
import styles from "./TodoBoard.module.css";

const VIEWS = [
  { id: "columns", label: "Columnas", icon: Columns3, component: TodoColumns },
  { id: "table", label: "Tabla", icon: Table2, component: TodoTable },
  { id: "list", label: "Ítems", icon: List, component: TodoList },
];

export default function TodoBoard({ initialTodos, initialCategories }) {
  const toast = useToast();
  const todoList = useTodoList(initialTodos);
  const categoryList = useCategoryList(initialCategories);
  const filters = useTodoFilters(todoList.todos, categoryList.byId);
  const [viewId, setViewId] = useStoredState("oj-todos-view", "columns");
  const [editing, setEditing] = useState(null); // null | "new" | todo
  const [deleting, setDeleting] = useState(null);
  const [managingCategories, setManagingCategories] = useState(false);

  const view = VIEWS.find((item) => item.id === viewId) ?? VIEWS[0];
  const total = todoList.todos.length;

  const countByCategory = useMemo(() => {
    const counts = new Map();
    for (const todo of todoList.todos) {
      if (todo.categoryId) counts.set(todo.categoryId, (counts.get(todo.categoryId) ?? 0) + 1);
    }
    return counts;
  }, [todoList.todos]);

  async function handleSave(data) {
    const result = editing === "new" ? await todoList.create(data) : await todoList.update(editing.id, data);
    if (result.ok) setEditing(null);
  }

  async function handleQuickAdd(data) {
    const { categoryId, priority } = filters.filters;
    // Si hay un filtro de categoría o prioridad, el nuevo pendiente lo hereda para no "desaparecer".
    return todoList.create({
      ...data,
      categoryId: categoryId && categoryId !== "none" ? categoryId : null,
      priority: priority && priority !== "none" ? priority : null,
    });
  }

  async function handleStatus(todo, status) {
    const result = await todoList.setStatus(todo, status);
    if (result.ok && status === "done" && todo.status !== "done") {
      toast.show({
        message: `“${todo.title}” realizado`,
        tone: "success",
        action: { label: "Deshacer", onClick: () => todoList.setStatus({ ...todo, status: "done" }, "pending") },
      });
    }
  }

  async function handleDelete() {
    const result = await todoList.remove(deleting.id);
    if (result.ok) setDeleting(null);
  }

  const handlers = { onEdit: setEditing, onStatus: handleStatus, onDelete: setDeleting };
  const View = view.component;

  return (
    <div className={styles.board}>
      <div className={styles.toolbar}>
        <SearchBar
          value={filters.query}
          onChange={filters.setQuery}
          label="Buscar pendientes"
          placeholder="Buscar en títulos, descripciones y categorías"
          className={styles.search}
        />
        <SegmentedControl label="Vista" items={VIEWS} value={view.id} onChange={setViewId} iconOnly />
        <Button icon={Tags} onClick={() => setManagingCategories(true)} className={styles.compactMobile} aria-label="Categorías">
          Categorías
        </Button>
        <Button variant="primary" icon={Plus} onClick={() => setEditing("new")} className={styles.add}>
          Nuevo
        </Button>
      </div>

      <TodoFilters
        filters={filters.filters}
        setFilter={filters.setFilter}
        categories={categoryList.categories}
        activeCount={filters.activeCount}
        onClear={filters.clear}
        hideStatus={view.id === "columns"}
      />

      <QuickAddTodo onAdd={handleQuickAdd} />

      {total === 0 ? (
        <EmptyState
          icon={ListTodo}
          title="Nada pendiente por ahora"
          description="Anotá arriba lo que tengas que hacer. Después lo podés ordenar con categorías y prioridades."
        />
      ) : filters.visible.length === 0 ? (
        <EmptyState
          compact
          icon={SearchX}
          title="Nada coincide"
          description="Probá con otra búsqueda o sacá algún filtro."
          action={
            <Button variant="ghost" onClick={filters.clear}>
              Limpiar búsqueda y filtros
            </Button>
          }
        />
      ) : (
        <div key={view.id} className={styles.view}>
          <View
            todos={filters.visible}
            categoriesById={categoryList.byId}
            terms={filters.terms}
            emptyHint={{ pending: "Todo al día.", done: "Arrastrá acá lo que vayas terminando." }}
            {...handlers}
          />
        </div>
      )}

      <TodoFormModal
        open={editing !== null}
        todo={editing === "new" ? null : editing}
        categories={categoryList.categories}
        saving={todoList.saving}
        onClose={() => setEditing(null)}
        onSave={handleSave}
      />

      <ConfirmDialog
        open={deleting !== null}
        onClose={() => setDeleting(null)}
        onConfirm={handleDelete}
        loading={todoList.deleting}
        title="¿Borrar este pendiente?"
        description={deleting?.title}
      />

      <CategoryManager
        open={managingCategories}
        onClose={() => setManagingCategories(false)}
        categoryList={categoryList}
        countByCategory={countByCategory}
        onDeleted={todoList.clearCategory}
      />
    </div>
  );
}
