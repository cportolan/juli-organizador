import { CalendarDays, Cake, Users } from "lucide-react";
import { TONES } from "@/lib/utils/tones";

const toneHex = (id) => TONES.find((tone) => tone.id === id).hex;

export const EVENT_TYPES = [
  { id: "event", label: "Evento", icon: CalendarDays, color: null },
  { id: "meeting", label: "Reunión", icon: Users, color: toneHex("sky") },
  { id: "birthday", label: "Cumpleaños", icon: Cake, color: toneHex("rose") },
];

export function eventTypeMeta(id) {
  return EVENT_TYPES.find((type) => type.id === id) ?? EVENT_TYPES[0];
}

/** Color con el que se pinta un evento: el propio, el de su tipo o el primario. */
export function eventColor(event) {
  return event.color ?? eventTypeMeta(event.type).color ?? "var(--primary)";
}

export function isRecurring(event) {
  return Boolean(event?.rrule || event?.seriesId);
}
