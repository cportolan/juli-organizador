import { connection } from "next/server";
import { getCategories, getTodos } from "@/features/todos/api";
import CalendarAside from "../CalendarAside/CalendarAside";

export default async function CalendarAsideLoader() {
  await connection();
  const [todos, categories] = await Promise.all([getTodos(), getCategories()]);

  return <CalendarAside todos={todos} categories={categories} />;
}
