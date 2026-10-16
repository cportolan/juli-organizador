import { getEvents } from "@/features/calendar/api";
import { toDateKey } from "@/lib/utils/dates";
import { getCalendarRange, parseCalendarParams } from "@/lib/utils/calendar";
import CalendarView from "../CalendarView/CalendarView";

export default async function CalendarLoader({ searchParams }) {
  const params = await searchParams;
  const today = toDateKey(new Date());
  const state = parseCalendarParams(params, today);
  const range = getCalendarRange(state);
  const events = await getEvents({ from: range.from, to: range.to });

  return <CalendarView state={state} today={today} days={range.days} events={events} />;
}
