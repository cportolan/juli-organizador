"use client";

import styles from "./DateTimeFields.module.css";

/** Inicio y fin del evento. Con "todo el día" solo pide fechas. */
export default function DateTimeFields({ form, onStart, onChange, error }) {
  return (
    <div className={styles.fields}>
      <div className={styles.row}>
        <span className={styles.label} id="event-start-label">
          Empieza
        </span>
        <input
          type="date"
          className={styles.input}
          value={form.startDate}
          onChange={(event) => event.target.value && onStart({ date: event.target.value })}
          aria-labelledby="event-start-label"
          required
        />
        {!form.allDay && (
          <input
            type="time"
            step={300}
            className={styles.input}
            value={form.startTime}
            onChange={(event) => event.target.value && onStart({ time: event.target.value })}
            aria-label="Hora de inicio"
            required
          />
        )}
      </div>
      <div className={styles.row}>
        <span className={styles.label} id="event-end-label">
          Termina
        </span>
        <input
          type="date"
          className={styles.input}
          value={form.endDate}
          min={form.startDate}
          onChange={(event) => event.target.value && onChange({ endDate: event.target.value })}
          aria-labelledby="event-end-label"
          aria-invalid={Boolean(error) || undefined}
          aria-describedby={error ? "event-end-error" : undefined}
          required
        />
        {!form.allDay && (
          <input
            type="time"
            step={300}
            className={styles.input}
            value={form.endTime}
            onChange={(event) => event.target.value && onChange({ endTime: event.target.value })}
            aria-label="Hora de fin"
            aria-invalid={Boolean(error) || undefined}
            required
          />
        )}
      </div>
      {error && (
        <p id="event-end-error" className={styles.error} role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
