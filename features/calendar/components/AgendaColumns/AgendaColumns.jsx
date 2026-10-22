"use client";

import { useMemo } from "react";
import { Plus } from "lucide-react";
import { cx } from "@/lib/utils/cx";
import { eventsOnDay, nextFreeSlot, occurrenceKey, sortDayEvents } from "@/lib/utils/calendar";
import DayHeading from "../DayHeading/DayHeading";
import EventCard from "../EventCard/EventCard";
import styles from "./AgendaColumns.module.css";

/**
 * Vista de tarjetas: una columna por día con los eventos uno abajo del otro, por horario.
 * En el teléfono los días van uno debajo del otro, como una agenda.
 */
export default function AgendaColumns({ days, events, holidays, today, selectedDate, onCreate, onOpen, onDayClick }) {
  const byDay = useMemo(() => days.map((day) => sortDayEvents(eventsOnDay(events, day))), [days, events]);

  return (
    <div className={styles.columns} style={{ "--days": days.length }} data-single={days.length === 1 || undefined}>
      {days.map((day, index) => {
        const dayEvents = byDay[index];
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
              onClick={() => onCreate(nextFreeSlot(dayEvents, day))}
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
