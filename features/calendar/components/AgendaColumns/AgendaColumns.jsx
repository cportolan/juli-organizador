"use client";

import { useMemo } from "react";
import { Plus } from "lucide-react";
import { cx } from "@/lib/utils/cx";
import { eventsOnDay, isAllDayLike, minutesOfDay, minutesToTime, occurrenceKey, sortDayEvents } from "@/lib/utils/calendar";
import { toDateKey } from "@/lib/utils/dates";
import DayHeading from "../DayHeading/DayHeading";
import EventCard from "../EventCard/EventCard";
import styles from "./AgendaColumns.module.css";

const DEFAULT_START = 9 * 60;
const LATEST_START = 23 * 60;

/** Hora para "Agregar": la hora en punto después del último evento del día, o las 9. */
function nextFreeStart(dayEvents, day) {
  const ends = dayEvents
    .filter((event) => !isAllDayLike(event) && toDateKey(event.endAt) === day)
    .map((event) => minutesOfDay(event.endAt));
  if (!ends.length) return DEFAULT_START;
  return Math.min(Math.ceil(Math.max(...ends) / 60) * 60, LATEST_START);
}

/** Vista de tarjetas: una columna por día con los eventos uno abajo del otro, por horario. */
export default function AgendaColumns({ days, events, holidays, today, selectedDate, onCreate, onOpen, onDayClick }) {
  const byDay = useMemo(() => days.map((day) => sortDayEvents(eventsOnDay(events, day))), [days, events]);

  return (
    <div className={styles.columns} style={{ "--days": days.length }}>
      {days.map((day, index) => {
        const dayEvents = byDay[index];
        const start = nextFreeStart(dayEvents, day);
        return (
          <section key={day} className={cx(styles.column, day === today && styles.today)}>
            <DayHeading
              day={day}
              today={today}
              selectedDate={selectedDate}
              holiday={holidays.get(day)}
              showHolidayName
              onClick={onDayClick}
              className={styles.heading}
            />
            {dayEvents.length > 0 && (
              <ul className={styles.list}>
                {dayEvents.map((event) => (
                  <li key={occurrenceKey(event)}>
                    <EventCard event={event} onOpen={onOpen} />
                  </li>
                ))}
              </ul>
            )}
            <button
              type="button"
              className={cx(styles.add, dayEvents.length === 0 && styles.addEmpty)}
              onClick={() => onCreate({ date: day, start: minutesToTime(start), end: minutesToTime(start + 60) })}
            >
              <Plus aria-hidden />
              {dayEvents.length === 0 ? "Libre · agregar" : "Agregar"}
            </button>
          </section>
        );
      })}
    </div>
  );
}
