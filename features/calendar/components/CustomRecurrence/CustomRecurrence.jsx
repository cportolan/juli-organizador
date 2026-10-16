"use client";

import { useId } from "react";
import { addDaysToKey } from "@/lib/utils/calendar";
import { FREQUENCIES, WEEKDAYS, weekdayOf } from "@/lib/utils/recurrence";
import styles from "./CustomRecurrence.module.css";

const ENDS = [
  { id: "never", label: "Nunca" },
  { id: "until", label: "El" },
  { id: "count", label: "Después de" },
];

function endMode(rule) {
  if (rule.count) return "count";
  if (rule.until) return "until";
  return "never";
}

/** Repetición personalizada: cada N días/semanas/meses/años, qué días y cuándo termina. */
export default function CustomRecurrence({ rule, startDate, onChange }) {
  const name = useId();
  const update = (changes) => onChange({ ...rule, ...changes });
  const mode = endMode(rule);
  const plural = rule.interval !== 1;

  function setFreq(freq) {
    update({ freq, byDay: freq === "WEEKLY" ? [weekdayOf(startDate)] : [] });
  }

  function toggleDay(day) {
    const byDay = rule.byDay.includes(day) ? rule.byDay.filter((item) => item !== day) : [...rule.byDay, day];
    update({ byDay: byDay.length ? byDay : [day] });
  }

  function setEnd(next) {
    if (next === "never") update({ until: null, count: null });
    if (next === "until") update({ count: null, until: rule.until ?? addDaysToKey(startDate, 30) });
    if (next === "count") update({ until: null, count: rule.count ?? 10 });
  }

  return (
    <div className={styles.custom}>
      <div className={styles.line}>
        <label htmlFor={`${name}-interval`}>Repetir cada</label>
        <input
          id={`${name}-interval`}
          type="number"
          min={1}
          max={99}
          className={styles.number}
          value={rule.interval}
          onChange={(event) => update({ interval: Math.max(1, Math.min(99, Number(event.target.value) || 1)) })}
        />
        <select
          className={styles.select}
          value={rule.freq}
          onChange={(event) => setFreq(event.target.value)}
          aria-label="Frecuencia"
        >
          {FREQUENCIES.map((freq) => (
            <option key={freq.id} value={freq.id}>
              {plural ? freq.plural : freq.singular}
            </option>
          ))}
        </select>
      </div>

      {rule.freq === "WEEKLY" && (
        <div className={styles.block} role="group" aria-label="Días de la semana">
          <span className={styles.caption}>Los días</span>
          <div className={styles.days}>
            {WEEKDAYS.map((day) => (
              <button
                key={day.id}
                type="button"
                className={styles.day}
                aria-pressed={rule.byDay.includes(day.id)}
                aria-label={day.label}
                title={day.label}
                onClick={() => toggleDay(day.id)}
              >
                {day.short}
              </button>
            ))}
          </div>
        </div>
      )}

      <fieldset className={styles.block}>
        <legend className={styles.caption}>Termina</legend>
        {ENDS.map((end) => (
          <label key={end.id} className={styles.end}>
            <input type="radio" name={name} checked={mode === end.id} onChange={() => setEnd(end.id)} className={styles.radio} />
            <span>{end.label}</span>
            {end.id === "until" && (
              <input
                type="date"
                className={styles.date}
                value={rule.until ?? ""}
                min={startDate}
                disabled={mode !== "until"}
                onChange={(event) => event.target.value && update({ until: event.target.value, count: null })}
                aria-label="Fecha de fin"
              />
            )}
            {end.id === "count" && (
              <>
                <input
                  type="number"
                  min={1}
                  max={999}
                  className={styles.number}
                  value={rule.count ?? 10}
                  disabled={mode !== "count"}
                  onChange={(event) => update({ count: Math.max(1, Number(event.target.value) || 1), until: null })}
                  aria-label="Cantidad de repeticiones"
                />
                <span>{rule.count === 1 ? "vez" : "veces"}</span>
              </>
            )}
          </label>
        ))}
      </fieldset>
    </div>
  );
}
