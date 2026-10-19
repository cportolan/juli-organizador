import { formatDate } from "./dates";
import { combineDateTime, keyToDate } from "./calendar";

// Reglas de repetición (RRULE de RFC 5545) del lado del cliente: el formulario
// las arma y las lee. El backend las valida y les agrega DTSTART.

export const FREQUENCIES = [
  { id: "DAILY", singular: "día", plural: "días" },
  { id: "WEEKLY", singular: "semana", plural: "semanas" },
  { id: "MONTHLY", singular: "mes", plural: "meses" },
  { id: "YEARLY", singular: "año", plural: "años" },
];

export const WEEKDAYS = [
  { id: "MO", short: "L", label: "lunes" },
  { id: "TU", short: "M", label: "martes" },
  { id: "WE", short: "M", label: "miércoles" },
  { id: "TH", short: "J", label: "jueves" },
  { id: "FR", short: "V", label: "viernes" },
  { id: "SA", short: "S", label: "sábado" },
  { id: "SU", short: "D", label: "domingo" },
];

const WORKDAYS = ["MO", "TU", "WE", "TH", "FR"];

const ORDINALS = { 1: "primer", 2: "segundo", 3: "tercer", 4: "cuarto", "-1": "último" };

/**
 * Repeticiones mensuales por posición (BYDAY + BYSETPOS): "el primer lunes",
 * "el último día hábil". Día hábil = lunes a viernes (no contempla feriados).
 */
const MONTHLY_POSITIONS = [
  { id: "firstWorkday", label: "El primer día hábil de cada mes", byDay: WORKDAYS, setPos: 1 },
  { id: "firstMonday", label: "El primer lunes de cada mes", byDay: ["MO"], setPos: 1 },
  { id: "lastWorkday", label: "El último día hábil de cada mes", byDay: WORKDAYS, setPos: -1 },
];

/** Código de día de la semana (MO..SU) de una clave de día. */
export function weekdayOf(key) {
  return WEEKDAYS[(keyToDate(key).getDay() + 6) % 7].id;
}

/**
 * Lee una RRULE ("DTSTART:...\nRRULE:FREQ=..." o solo "FREQ=...").
 * Devuelve { freq, interval, byDay, setPos | null, until (clave de día) | null, count | null } o null.
 */
export function parseRrule(value) {
  if (!value) return null;
  const line = String(value)
    .split(/\r?\n/)
    .find((part) => /^(RRULE:)?FREQ=/i.test(part.trim()));
  if (!line) return null;

  const parts = Object.fromEntries(
    line
      .trim()
      .replace(/^RRULE:/i, "")
      .split(";")
      .map((pair) => pair.split("=")),
  );
  const until = parts.UNTIL?.match(/^(\d{4})(\d{2})(\d{2})(?:T(\d{2})(\d{2})(\d{2})(Z)?)?$/);
  let untilKey = null;
  if (until) {
    const [, y, m, d, hh = "00", mm = "00", ss = "00", utc] = until;
    untilKey = utc ? formatDate(new Date(`${y}-${m}-${d}T${hh}:${mm}:${ss}Z`), "yyyy-MM-dd") : `${y}-${m}-${d}`;
  }

  const byDay = parts.BYDAY ? parts.BYDAY.split(",") : [];
  // "1MO" (primer lunes) equivale a BYDAY=MO;BYSETPOS=1.
  const ordinal = byDay.map((day) => day.slice(0, -2)).find(Boolean);
  const setPos = parts.BYSETPOS ?? ordinal;

  return {
    freq: parts.FREQ,
    interval: Number(parts.INTERVAL ?? 1),
    byDay: byDay.map((day) => day.slice(-2)),
    setPos: setPos ? Number(setPos) : null,
    until: untilKey,
    count: parts.COUNT ? Number(parts.COUNT) : null,
  };
}

/** Arma la RRULE. `until` es la clave del último día (inclusive) en la zona de la app. */
export function buildRrule(rule) {
  if (!rule) return null;
  const parts = [`FREQ=${rule.freq}`];
  if (rule.interval > 1) parts.push(`INTERVAL=${rule.interval}`);
  const byPosition = rule.freq === "MONTHLY" && rule.setPos && rule.byDay?.length;
  if ((rule.freq === "WEEKLY" || byPosition) && rule.byDay?.length) {
    const ordered = WEEKDAYS.map((day) => day.id).filter((id) => rule.byDay.includes(id));
    parts.push(`BYDAY=${ordered.join(",")}`);
  }
  if (byPosition) parts.push(`BYSETPOS=${rule.setPos}`);
  if (rule.count) parts.push(`COUNT=${rule.count}`);
  else if (rule.until) {
    const instant = new Date(combineDateTime(rule.until, "23:59")).toISOString();
    parts.push(`UNTIL=${instant.replace(/[-:]/g, "").replace(/\.\d{3}/, "")}`);
  }
  return parts.join(";");
}

/** Opciones rápidas del selector de repetición, según el día del evento. */
export function recurrencePresets(dateKey) {
  const weekday = weekdayOf(dateKey);
  const weekdayLabel = WEEKDAYS.find((day) => day.id === weekday).label;
  const date = keyToDate(dateKey);
  return [
    { id: "none", label: "No se repite", rule: null },
    { id: "daily", label: "Todos los días", rule: { freq: "DAILY", interval: 1, byDay: [] } },
    { id: "weekly", label: `Cada semana, el ${weekdayLabel}`, rule: { freq: "WEEKLY", interval: 1, byDay: [weekday] } },
    { id: "workdays", label: "De lunes a viernes", rule: { freq: "WEEKLY", interval: 1, byDay: WORKDAYS } },
    { id: "monthly", label: `Cada mes, el día ${date.getDate()}`, rule: { freq: "MONTHLY", interval: 1, byDay: [] } },
    ...MONTHLY_POSITIONS.map(({ id, label, byDay, setPos }) => ({
      id,
      label,
      rule: { freq: "MONTHLY", interval: 1, byDay, setPos },
    })),
    { id: "yearly", label: `Todos los años, el ${formatDate(date, "d 'de' MMMM")}`, rule: { freq: "YEARLY", interval: 1, byDay: [] } },
    { id: "custom", label: "Personalizado…", rule: null },
  ];
}

function sameRule(a, b) {
  return (
    a.freq === b.freq &&
    a.interval === b.interval &&
    [...(a.byDay ?? [])].sort().join() === [...(b.byDay ?? [])].sort().join() &&
    (a.setPos ?? null) === (b.setPos ?? null) &&
    !a.until &&
    !a.count
  );
}

/** Qué preset corresponde a una regla (o "custom"). */
export function presetIdFor(rule, dateKey) {
  if (!rule) return "none";
  const match = recurrencePresets(dateKey).find((preset) => preset.rule && sameRule(rule, preset.rule));
  // Semanal sin BYDAY equivale a "cada semana el mismo día".
  if (!match && rule.freq === "WEEKLY" && !rule.byDay.length && sameRule({ ...rule, byDay: [weekdayOf(dateKey)] }, recurrencePresets(dateKey)[2].rule)) {
    return "weekly";
  }
  return match?.id ?? "custom";
}

function joinList(items, conjunction = "y") {
  return items.length > 1 ? `${items.slice(0, -1).join(", ")} ${conjunction} ${items.at(-1)}` : (items[0] ?? "");
}

/** Días (claves) de un mes que caen en alguno de `byDay`. `month` puede pasarse de 11. */
function monthDaysMatching(year, month, byDay) {
  const days = [];
  // En UTC para no depender de la zona del navegador: solo importa el calendario.
  const day = new Date(Date.UTC(year, month, 1));
  const target = day.getUTCMonth();
  for (; day.getUTCMonth() === target; day.setUTCDate(day.getUTCDate() + 1)) {
    if (byDay.includes(WEEKDAYS[(day.getUTCDay() + 6) % 7].id)) days.push(day.toISOString().slice(0, 10));
  }
  return days;
}

/**
 * Primer día desde `dateKey` (inclusive) que cumple una regla mensual por
 * posición, o `dateKey` si la regla no es de ese tipo. Sirve para que el
 * evento empiece en una fecha que realmente se repite.
 */
export function firstPositionMatch(dateKey, rule) {
  if (rule?.freq !== "MONTHLY" || !rule.setPos || !rule.byDay?.length) return dateKey;
  const [year, month] = dateKey.split("-").map(Number);
  for (let offset = 0; offset < 13; offset += 1) {
    const days = monthDaysMatching(year, month - 1 + offset, rule.byDay);
    const match = days.at(rule.setPos > 0 ? rule.setPos - 1 : rule.setPos);
    if (match && match >= dateKey) return match;
  }
  return dateKey;
}

/** Descripción en castellano: "Cada 2 semanas, el lunes y miércoles, hasta el 31 dic". */
export function describeRrule(rule) {
  if (!rule) return "No se repite";
  const freq = FREQUENCIES.find((item) => item.id === rule.freq);
  let text = rule.interval > 1 ? `Cada ${rule.interval} ${freq.plural}` : `Cada ${freq.singular}`;
  if (rule.freq === "DAILY" && rule.interval === 1) text = "Todos los días";
  if (rule.freq === "WEEKLY" && rule.byDay.length) {
    const days = WEEKDAYS.filter((day) => rule.byDay.includes(day.id)).map((day) => day.label);
    text += `, el ${joinList(days)}`;
  }
  if (rule.freq === "MONTHLY" && rule.setPos && rule.byDay.length) {
    const workdays = WORKDAYS.every((day) => rule.byDay.includes(day)) && rule.byDay.length === WORKDAYS.length;
    const days = workdays
      ? "día hábil"
      : joinList(WEEKDAYS.filter((day) => rule.byDay.includes(day.id)).map((day) => day.label), "o");
    text += `, el ${ORDINALS[rule.setPos] ?? `${rule.setPos}.º`} ${days}`;
  }
  if (rule.count) text += `, ${rule.count} ${rule.count === 1 ? "vez" : "veces"}`;
  else if (rule.until) text += `, hasta el ${formatDate(keyToDate(rule.until), "d 'de' MMMM 'de' yyyy")}`;
  return text;
}
