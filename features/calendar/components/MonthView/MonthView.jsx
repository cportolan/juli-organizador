"use client";

import { useMemo } from "react";
import { cx } from "@/lib/utils/cx";
import { formatDate } from "@/lib/utils/dates";
import { eventsOnDay, isAllDayLike, keyToDate, occurrenceKey } from "@/lib/utils/calendar";
import EventChip from "../EventChip/EventChip";
import styles from "./MonthView.module.css";

const WEEKDAY_LABELS = ["lun", "mar", "mié", "jue", "vie", "sáb", "dom"];
const MAX_VISIBLE = 3;

function sortForDay(events) {
  // Primero los de todo el día, después por hora.
  return events.toSorted((a, b) => Number(isAllDayLike(b)) - Number(isAllDayLike(a)) || a.startAt.localeCompare(b.startAt));
}

/** Vista mensual: semanas de lunes a domingo. */
export default function MonthView({ days, month, events, today, selectedDate, onCreate, onOpen, onDayClick }) {
  const byDay = useMemo(() => days.map((day) => sortForDay(eventsOnDay(events, day))), [days, events]);

  return (
    <div className={styles.month}>
      <div className={styles.weekdays} aria-hidden>
        {WEEKDAY_LABELS.map((label) => (
          <span key={label}>{label}</span>
        ))}
      </div>
      <div className={styles.grid} style={{ "--weeks": days.length / 7 }}>
        {days.map((day, index) => {
          const dayEvents = byDay[index];
          const hidden = dayEvents.length - MAX_VISIBLE;
          const outside = day.slice(0, 7) !== month;
          return (
            <div
              key={day}
              className={cx(styles.cell, outside && styles.outside, day === selectedDate && styles.selected)}
              onClick={() => onCreate({ date: day, allDay: true })}
            >
              <button
                type="button"
                className={cx(styles.number, day === today && styles.today)}
                onClick={(event) => {
                  event.stopPropagation();
                  onDayClick(day);
                }}
                aria-label={formatDate(keyToDate(day), "EEEE d 'de' MMMM")}
              >
                {Number(day.slice(8))}
              </button>
              <div className={styles.events}>
                {dayEvents.slice(0, hidden > 0 ? MAX_VISIBLE - 1 : MAX_VISIBLE).map((event) => (
                  <EventChip key={occurrenceKey(event)} event={event} onOpen={onOpen} />
                ))}
                {hidden > 0 && (
                  <button
                    type="button"
                    className={styles.more}
                    onClick={(event) => {
                      event.stopPropagation();
                      onDayClick(day);
                    }}
                  >
                    {hidden + 1} más
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
