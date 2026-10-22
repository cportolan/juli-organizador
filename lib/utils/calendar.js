import { TZDate } from "@date-fns/tz";
import { addDays, addMonths, endOfMonth, endOfWeek, startOfMonth, startOfWeek } from "date-fns";
import { APP_TIME_ZONE, formatDate, inAppZone, toDateKey } from "./dates";

// Utilidades del calendario. Los días se representan con claves "YYYY-MM-DD"
// en la zona de la app; los instantes, con ISO 8601.

export const VIEWS = ["mes", "semana", "dia"];
export const WEEK_LENGTHS = [7, 5, 3];
export const DEFAULT_VIEW = { view: "semana", days: 7 };
const WEEK = { weekStartsOn: 1, in: inAppZone };
const DATE_KEY = /^\d{4}-\d{2}-\d{2}$/;

/** Medianoche (en la zona de la app) de una clave de día. */
export function keyToDate(key) {
  const [year, month, day] = key.split("-").map(Number);
  return new TZDate(year, month - 1, day, APP_TIME_ZONE);
}

export function addDaysToKey(key, amount) {
  return toDateKey(addDays(keyToDate(key), amount));
}

/** Instante ISO de la medianoche de un día. */
export function dayStartIso(key) {
  return new Date(+keyToDate(key)).toISOString();
}

/** Instante ISO a partir de un día y una hora "HH:mm". */
export function combineDateTime(key, time) {
  const [year, month, day] = key.split("-").map(Number);
  const [hours, minutes] = time.split(":").map(Number);
  return new Date(+new TZDate(year, month - 1, day, hours, minutes, APP_TIME_ZONE)).toISOString();
}

/** Minutos desde la medianoche (zona de la app) de un instante. */
export function minutesOfDay(iso) {
  const date = new TZDate(iso, APP_TIME_ZONE);
  return date.getHours() * 60 + date.getMinutes();
}

export function timeOf(iso) {
  return formatDate(iso, "HH:mm");
}

export function minutesToTime(minutes) {
  const clamped = Math.max(0, Math.min(minutes, 24 * 60 - 1));
  return `${String(Math.floor(clamped / 60)).padStart(2, "0")}:${String(clamped % 60).padStart(2, "0")}`;
}

/** Lee y valida vista, cantidad de días y fecha desde los searchParams. */
export function parseCalendarParams(params, todayKey) {
  const view = VIEWS.includes(params?.vista) ? params.vista : DEFAULT_VIEW.view;
  const days = WEEK_LENGTHS.includes(Number(params?.dias)) ? Number(params.dias) : DEFAULT_VIEW.days;
  const date = DATE_KEY.test(params?.fecha ?? "") && !Number.isNaN(Date.parse(params.fecha)) ? params.fecha : todayKey;
  return { view, days, date };
}

export function calendarHref({ view, days, date }) {
  const params = new URLSearchParams({ vista: view, fecha: date });
  if (view === "semana") params.set("dias", String(days));
  return `/calendario?${params}`;
}

/** Días visibles y rango [from, to) a pedir al backend. */
export function getCalendarRange({ view, days, date }) {
  const anchor = keyToDate(date);
  let first;
  let length;

  if (view === "mes") {
    first = startOfWeek(startOfMonth(anchor, { in: inAppZone }), WEEK);
    const last = endOfWeek(endOfMonth(anchor, { in: inAppZone }), WEEK);
    length = Math.round((last - first) / 86_400_000);
  } else if (view === "dia") {
    first = anchor;
    length = 1;
  } else {
    first = days === 3 ? anchor : startOfWeek(anchor, WEEK);
    length = days;
  }

  const firstKey = toDateKey(first);
  const keys = Array.from({ length }, (_, index) => addDaysToKey(firstKey, index));
  return { days: keys, from: dayStartIso(keys[0]), to: dayStartIso(addDaysToKey(keys.at(-1), 1)) };
}

/** Fecha a la que se mueve el calendario con las flechas. */
export function stepDate({ view, days, date }, direction) {
  if (view === "mes") return toDateKey(addMonths(keyToDate(date), direction));
  if (view === "dia") return addDaysToKey(date, direction);
  return addDaysToKey(date, direction * (days === 3 ? 3 : 7));
}

/** Título del período visible: "octubre 2026", "13 – 19 oct 2026", "viernes 16 de octubre". */
export function periodLabel({ view, date }, dayKeys) {
  if (view === "mes") return formatDate(keyToDate(date), "MMMM yyyy");
  if (view === "dia") return formatDate(keyToDate(date), "EEEE d 'de' MMMM");
  const first = keyToDate(dayKeys[0]);
  const last = keyToDate(dayKeys.at(-1));
  const sameMonth = dayKeys[0].slice(0, 7) === dayKeys.at(-1).slice(0, 7);
  const sameYear = dayKeys[0].slice(0, 4) === dayKeys.at(-1).slice(0, 4);
  const start = formatDate(first, sameMonth ? "d" : sameYear ? "d MMM" : "d MMM yyyy");
  return `${start} – ${formatDate(last, "d MMM yyyy")}`.replaceAll(".", "");
}

/** Último día (inclusive) que ocupa un evento. Los de día completo terminan a medianoche (exclusivo). */
export function lastDayKey(event) {
  const end = new Date(new Date(event.endAt).getTime() - 1);
  return end < new Date(event.startAt) ? toDateKey(event.startAt) : toDateKey(end);
}

/** true si el evento va en la fila de "todo el día" (día completo o de varios días). */
export function isAllDayLike(event) {
  return event.allDay || toDateKey(event.startAt) !== lastDayKey(event);
}

/** Eventos que tocan un día. */
export function eventsOnDay(events, key) {
  return events.filter((event) => toDateKey(event.startAt) <= key && lastDayKey(event) >= key);
}

/** Eventos de un día en orden: primero los de todo el día, después por hora. */
export function sortDayEvents(events) {
  return events.toSorted((a, b) => Number(isAllDayLike(b)) - Number(isAllDayLike(a)) || a.startAt.localeCompare(b.startAt));
}

const DEFAULT_START = 9 * 60;
const LATEST_START = 23 * 60;

/** Horario para "Agregar" en un día: la hora en punto después del último evento, o las 9. Dura una hora. */
export function nextFreeSlot(dayEvents, day) {
  const ends = dayEvents
    .filter((event) => !isAllDayLike(event) && toDateKey(event.endAt) === day)
    .map((event) => minutesOfDay(event.endAt));
  const start = ends.length ? Math.min(Math.ceil(Math.max(...ends) / 60) * 60, LATEST_START) : DEFAULT_START;
  return { date: day, start: minutesToTime(start), end: minutesToTime(start + 60) };
}

export function occurrenceKey(event) {
  return `${event.id}:${event.occurrenceDate ?? ""}`;
}

/**
 * Distribuye los eventos con hora de un día en columnas para que no se pisen.
 * Devuelve [{ event, top, height, column, columns }] en minutos.
 */
export function layoutDayEvents(events, minHeight = 20) {
  const items = events
    .map((event) => {
      const top = minutesOfDay(event.startAt);
      const end = toDateKey(event.endAt) > toDateKey(event.startAt) ? 24 * 60 : minutesOfDay(event.endAt);
      return { event, top, height: Math.max(end - top, minHeight) };
    })
    .sort((a, b) => a.top - b.top || b.height - a.height);

  const result = [];
  let cluster = [];
  let clusterEnd = -1;

  const closeCluster = () => {
    const columnEnds = [];
    for (const item of cluster) {
      let column = columnEnds.findIndex((end) => end <= item.top);
      if (column === -1) column = columnEnds.length;
      columnEnds[column] = item.top + item.height;
      item.column = column;
    }
    for (const item of cluster) result.push({ ...item, columns: columnEnds.length });
    cluster = [];
  };

  for (const item of items) {
    if (item.top >= clusterEnd && cluster.length) closeCluster();
    cluster.push(item);
    clusterEnd = Math.max(clusterEnd, item.top + item.height);
  }
  if (cluster.length) closeCluster();
  return result;
}
