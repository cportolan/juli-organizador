import { connection } from "next/server";
import { getDayNote } from "@/features/calendar/api";
import { getCategories, getTodos } from "@/features/todos/api";
import { toDateKey } from "@/lib/utils/dates";
import { parseCalendarParams } from "@/lib/utils/calendar";
import CalendarAside from "../CalendarAside/CalendarAside";

export default async function CalendarAsideLoader({ searchParams }) {
  await connection();
  const params = await searchParams;
  const today = toDateKey(new Date());
  const state = parseCalendarParams(params, today);
  const [note, todos, categories] = await Promise.all([getDayNote(state.date), getTodos(), getCategories()]);

  return <CalendarAside state={state} today={today} note={note} todos={todos} categories={categories} />;
}
