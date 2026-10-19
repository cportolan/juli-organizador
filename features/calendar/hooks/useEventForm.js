"use client";

import { useState } from "react";
import { toDateKey } from "@/lib/utils/dates";
import { addDaysToKey, combineDateTime, dayStartIso, lastDayKey, minutesToTime, timeOf } from "@/lib/utils/calendar";
import {
  buildRrule,
  firstPositionMatch,
  parseRrule,
  presetIdFor,
  recurrencePresets,
  weekdayOf,
} from "@/lib/utils/recurrence";

function toMinutes(time) {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

function initialState(event, draft) {
  const source = event ?? draft;
  const allDay = Boolean(source.allDay);
  const startDate = toDateKey(source.startAt);
  const rule = parseRrule(event?.rrule);
  return {
    title: event?.title ?? "",
    type: event?.type ?? draft?.type ?? "event",
    allDay,
    startDate,
    startTime: allDay ? "09:00" : timeOf(source.startAt),
    endDate: allDay ? lastDayKey(source) : toDateKey(source.endAt),
    endTime: allDay ? "10:00" : timeOf(source.endAt),
    location: event?.location ?? "",
    description: event?.description ?? "",
    color: event?.color ?? null,
    rule,
    presetId: presetIdFor(rule, startDate),
  };
}

/** Estado del formulario de evento, con fechas que se acomodan solas. */
export function useEventForm(event, draft) {
  const [form, setForm] = useState(() => initialState(event, draft));
  const [error, setError] = useState(null);

  const set = (changes) => {
    setError(null);
    setForm((current) => ({ ...current, ...changes }));
  };

  /**
   * Al mover el inicio, el fin se mueve igual (conserva la duración).
   * Con una regla tipo "el primer lunes de cada mes", el inicio salta al primer
   * día que la cumple, así la fecha del formulario es la primera repetición.
   */
  function setStart({ date: picked = form.startDate, time = form.startTime }, extra = {}) {
    const date = firstPositionMatch(picked, extra.rule ?? form.rule);
    const startMinutes = (key, value) => Date.parse(`${key}T00:00:00Z`) / 60000 + toMinutes(value);
    const duration = startMinutes(form.endDate, form.endTime) - startMinutes(form.startDate, form.startTime);
    const newStart = startMinutes(date, time);
    const end = newStart + Math.max(duration, 0);
    const endDay = Math.floor(end / 1440);
    const baseDay = Math.floor(newStart / 1440);
    const changes = {
      startDate: date,
      startTime: time,
      endDate: addDaysToKey(date, endDay - baseDay),
      endTime: minutesToTime(end - endDay * 1440),
    };
    // Las repeticiones rápidas dependen del día ("cada semana, el viernes").
    if (date !== form.startDate && form.presetId !== "custom" && form.presetId !== "none") {
      changes.rule = recurrencePresets(date).find((preset) => preset.id === form.presetId).rule;
    }
    set({ ...changes, ...extra });
  }

  function setType(type) {
    const changes = { type };
    // Los cumpleaños suelen ser de día completo y anuales.
    if (type === "birthday" && !event) {
      changes.allDay = true;
      if (form.presetId === "none") {
        changes.presetId = "yearly";
        changes.rule = recurrencePresets(form.startDate).find((preset) => preset.id === "yearly").rule;
      }
    }
    set(changes);
  }

  function setPreset(presetId) {
    if (presetId === "custom") {
      set({ presetId, rule: form.rule ?? { freq: "WEEKLY", interval: 1, byDay: [weekdayOf(form.startDate)], until: null, count: null } });
      return;
    }
    setStart({}, { presetId, rule: recurrencePresets(form.startDate).find((preset) => preset.id === presetId).rule });
  }

  /** Valida y devuelve los datos para createEvent/updateEvent, o null. */
  function toData() {
    const title = form.title.trim();
    if (!title) {
      setError({ field: "title", message: "Escribí un título." });
      return null;
    }
    const startAt = form.allDay ? dayStartIso(form.startDate) : combineDateTime(form.startDate, form.startTime);
    const endAt = form.allDay ? dayStartIso(addDaysToKey(form.endDate, 1)) : combineDateTime(form.endDate, form.endTime);
    if (new Date(endAt) < new Date(startAt) || (!form.allDay && endAt === startAt)) {
      setError({ field: "end", message: "El fin tiene que ser después del inicio." });
      return null;
    }
    if (form.rule?.until && form.rule.until < form.startDate) {
      setError({ field: "rule", message: "La repetición no puede terminar antes de empezar." });
      return null;
    }
    return {
      title,
      type: form.type,
      allDay: form.allDay,
      startAt,
      endAt,
      location: form.location.trim() || null,
      description: form.description.trim() || null,
      color: form.color,
      rrule: buildRrule(form.rule),
    };
  }

  return { form, set, setStart, setType, setPreset, error, toData };
}
