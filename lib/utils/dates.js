import { format } from "date-fns";
import { es } from "date-fns/locale";
import { tz } from "@date-fns/tz";

/**
 * Zona horaria de la app. Juli está en Argentina y el servidor puede estar en
 * otra zona: formatear siempre con esta zona evita fechas corridas un día y
 * diferencias entre el HTML del servidor y el del navegador.
 */
export const APP_TIME_ZONE = "America/Argentina/Buenos_Aires";
export const inAppZone = tz(APP_TIME_ZONE);

/** format() de date-fns en español y en la zona de la app. */
export function formatDate(date, pattern) {
  return format(date, pattern, { locale: es, in: inAppZone });
}

/** Fecha local YYYY-MM-DD de un instante (ISO o Date). */
export function toDateKey(date) {
  return formatDate(date, "yyyy-MM-dd");
}

/** "16 oct" o "16 oct 2025" si no es del año en curso. */
export function formatShortDate(date, todayKey) {
  const sameYear = todayKey ? toDateKey(date).slice(0, 4) === todayKey.slice(0, 4) : true;
  return formatDate(date, sameYear ? "d MMM" : "d MMM yyyy").replace(".", "");
}

/** Días enteros entre dos claves YYYY-MM-DD (b - a). */
export function daysBetweenKeys(a, b) {
  return Math.round((Date.parse(`${b}T00:00:00Z`) - Date.parse(`${a}T00:00:00Z`)) / 86_400_000);
}
