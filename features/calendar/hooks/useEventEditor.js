"use client";

import { useState } from "react";
import { useMutation } from "@/lib/hooks/useMutation";
import { createEvent, deleteEvent, updateEvent } from "@/features/calendar/actions";
import { parseRrule } from "@/lib/utils/recurrence";
import { isRecurring } from "../components/eventMeta";

const FIELDS = ["title", "description", "type", "startAt", "endAt", "allDay", "color", "location", "rrule"];

function sameValue(key, a, b) {
  if (key === "startAt" || key === "endAt") return new Date(a).getTime() === new Date(b).getTime();
  if (key === "rrule") return (parseRrule(a) && JSON.stringify(parseRrule(a))) === (parseRrule(b) && JSON.stringify(parseRrule(b)));
  return (a ?? null) === (b ?? null);
}

/** Inicio de la serie: el DTSTART que el backend incluye en la RRULE. */
function seriesStart(rrule) {
  const match = String(rrule ?? "").match(/DTSTART(?:;[^:]*)?:(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})Z/);
  if (!match) return null;
  const [, y, m, d, hh, mm, ss] = match;
  return new Date(`${y}-${m}-${d}T${hh}:${mm}:${ss}Z`);
}

/**
 * Para "todos": se mandan solo los campos que cambiaron y, si cambió el
 * horario, se corre el inicio de la serie lo mismo que se corrió esta repetición
 * (así editar la hora desde una repetición no mueve la serie a ese día).
 */
function changesForWholeSeries(event, data) {
  const changes = Object.fromEntries(FIELDS.filter((key) => !sameValue(key, event[key], data[key])).map((key) => [key, data[key]]));
  const start = seriesStart(event.rrule);
  if (start && ("startAt" in changes || "endAt" in changes)) {
    const shift = new Date(data.startAt) - new Date(event.startAt);
    const duration = new Date(data.endAt) - new Date(data.startAt);
    const newStart = new Date(start.getTime() + shift);
    changes.startAt = newStart.toISOString();
    changes.endAt = new Date(newStart.getTime() + duration).toISOString();
  }
  return changes;
}

/**
 * Alta, edición y borrado de eventos. Si el evento se repite, primero pregunta
 * el alcance ("solo este", "este y los siguientes", "todos").
 * `onDone` refresca el calendario.
 */
export function useEventEditor({ onDone }) {
  const [editing, setEditing] = useState(null); // { event | null, draft }
  const [scopeRequest, setScopeRequest] = useState(null); // { kind: "update" | "delete", data?, allowThis }
  const [runCreate, creating] = useMutation(createEvent, { successMessage: "Evento creado" });
  const [runUpdate, updating] = useMutation(updateEvent, { successMessage: "Evento actualizado" });
  const [runDelete, deleting] = useMutation(deleteEvent, { successMessage: "Evento borrado" });

  const event = editing?.event ?? null;

  function close() {
    setEditing(null);
    setScopeRequest(null);
  }

  async function finish(result) {
    if (!result.ok) return;
    close();
    onDone();
  }

  async function applyUpdate(scope, data) {
    const payload = scope === "all" && isRecurring(event) ? changesForWholeSeries(event, data) : data;
    if (!Object.keys(payload).length) return close();
    finish(await runUpdate({ id: event.id, occurrenceDate: event.occurrenceDate, scope, data: payload }));
  }

  async function save(data) {
    if (!event) return finish(await runCreate(data));
    if (!isRecurring(event)) return applyUpdate("all", data);
    // Si se cambió la repetición, "solo este" no tiene sentido.
    setScopeRequest({ kind: "update", data, allowThis: sameValue("rrule", event.rrule, data.rrule) });
  }

  async function remove() {
    if (!isRecurring(event)) {
      return finish(await runDelete({ id: event.id, occurrenceDate: event.occurrenceDate, scope: "all" }));
    }
    setScopeRequest({ kind: "delete", allowThis: true });
  }

  async function confirmScope(scope) {
    if (scopeRequest.kind === "update") return applyUpdate(scope, scopeRequest.data);
    finish(await runDelete({ id: event.id, occurrenceDate: event.occurrenceDate, scope }));
  }

  return {
    editing,
    openNew: (draft) => setEditing({ event: null, draft }),
    openEvent: (selected) => setEditing({ event: selected, draft: null }),
    close,
    save,
    remove,
    scopeRequest,
    cancelScope: () => setScopeRequest(null),
    confirmScope,
    saving: creating || updating,
    deleting,
  };
}
