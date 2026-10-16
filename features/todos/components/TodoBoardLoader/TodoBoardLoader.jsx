import { getCategories, getTodos } from "@/features/todos/api";
import TodoBoard from "../TodoBoard/TodoBoard";

export default async function TodoBoardLoader() {
  const [todos, categories] = await Promise.all([getTodos(), getCategories()]);
  return <TodoBoard initialTodos={todos} initialCategories={categories} />;
}
