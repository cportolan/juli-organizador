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

/** Código de día de la semana (MO..SU) de una clave de día. */
export function weekdayOf(key) {
  return WEEKDAYS[(keyToDate(key).getDay() + 6) % 7].id;
}

/**
 * Lee una RRULE ("DTSTART:...\nRRULE:FREQ=..." o solo "FREQ=...").
 * Devuelve { freq, interval, byDay, until (clave de día) | null, count | null } o null.
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

  return {
    freq: parts.FREQ,
    interval: Number(parts.INTERVAL ?? 1),
    byDay: parts.BYDAY ? parts.BYDAY.split(",").map((day) => day.slice(-2)) : [],
    until: untilKey,
    count: parts.COUNT ? Number(parts.COUNT) : null,
  };
}

/** Arma la RRULE. `until` es la clave del último día (inclusive) en la zona de la app. */
export function buildRrule(rule) {
  if (!rule) return null;
  const parts = [`FREQ=${rule.freq}`];
  if (rule.interval > 1) parts.push(`INTERVAL=${rule.interval}`);
  if (rule.freq === "WEEKLY" && rule.byDay?.length) {
    const ordered = WEEKDAYS.map((day) => day.id).filter((id) => rule.byDay.includes(id));
    parts.push(`BYDAY=${ordered.join(",")}`);
  }
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
    { id: "yearly", label: `Todos los años, el ${formatDate(date, "d 'de' MMMM")}`, rule: { freq: "YEARLY", interval: 1, byDay: [] } },
    { id: "custom", label: "Personalizado…", rule: null },
  ];
}

function sameRule(a, b) {
  return (
    a.freq === b.freq &&
    a.interval === b.interval &&
    [...(a.byDay ?? [])].sort().join() === [...(b.byDay ?? [])].sort().join() &&
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

function joinList(items) {
  return items.length > 1 ? `${items.slice(0, -1).join(", ")} y ${items.at(-1)}` : (items[0] ?? "");
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
  if (rule.count) text += `, ${rule.count} ${rule.count === 1 ? "vez" : "veces"}`;
  else if (rule.until) text += `, hasta el ${formatDate(keyToDate(rule.until), "d 'de' MMMM 'de' yyyy")}`;
  return text;
}
