import { CircleCheck, CircleDashed } from "lucide-react";

export const STATUSES = [
  { id: "pending", label: "Pendiente", plural: "Pendientes", icon: CircleDashed },
  { id: "done", label: "Realizado", plural: "Realizados", icon: CircleCheck },
];

export const PRIORITIES = [
  { id: "high", label: "Alta", tone: "rose", rank: 3 },
  { id: "medium", label: "Media", tone: "butter", rank: 2 },
  { id: "low", label: "Baja", tone: "sky", rank: 1 },
];

export const DEFAULT_CATEGORY_COLOR = "#f0b6c8";

export function priorityMeta(id) {
  return PRIORITIES.find((priority) => priority.id === id) ?? null;
}

export function statusMeta(id) {
  return STATUSES.find((status) => status.id === id) ?? STATUSES[0];
}

export function otherStatus(status) {
  return status === "done" ? "pending" : "done";
}
