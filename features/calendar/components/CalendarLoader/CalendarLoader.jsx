import { connection } from "next/server";
import { getEvents, getHolidays } from "@/features/calendar/api";
import { toDateKey } from "@/lib/utils/dates";
import { getCalendarRange, parseCalendarParams } from "@/lib/utils/calendar";
import CalendarView from "../CalendarView/CalendarView";

export default async function CalendarLoader({ searchParams }) {
  await connection();
  const params = await searchParams;
  const today = toDateKey(new Date());
  const state = parseCalendarParams(params, today);
  const range = getCalendarRange(state);
  const [events, holidays] = await Promise.all([
    getEvents({ from: range.from, to: range.to }),
    getHolidays({ from: range.days[0], to: range.days.at(-1) }),
  ]);

  return <CalendarView state={state} today={today} days={range.days} events={events} holidays={holidays} />;
}
