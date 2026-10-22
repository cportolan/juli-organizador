"use client";

import { useMemo, useState } from "react";
import { cx } from "@/lib/utils/cx";
import { formatDate } from "@/lib/utils/dates";
import { eventsOnDay, keyToDate, occurrenceKey, sortDayEvents } from "@/lib/utils/calendar";
import { PHONE_QUERY, useMediaQuery } from "@/lib/hooks/useMediaQuery";
import { eventColor } from "../eventMeta";
import EventChip from "../EventChip/EventChip";
import MonthDayAgenda from "../MonthDayAgenda/MonthDayAgenda";
import styles from "./MonthView.module.css";

const WEEKDAY_LABELS = ["lun", "mar", "mié", "jue", "vie", "sáb", "dom"];
const MAX_VISIBLE = 3;

/**
 * Vista mensual: semanas de lunes a domingo. En el teléfono la grilla es
 * compacta (puntos de color) y al tocar un día se listan sus eventos abajo.
 */
export default function MonthView({ days, month, events, holidays, today, selectedDate, onCreate, onOpen, onDayClick }) {
  const byDay = useMemo(() => days.map((day) => sortDayEvents(eventsOnDay(events, day))), [days, events]);
  const phone = useMediaQuery(PHONE_QUERY);
  const [picked, setPicked] = useState(today.slice(0, 7) === month ? today : selectedDate);
  const pickedIndex = days.indexOf(picked);

  return (
    <div className={cx(styles.month, phone && styles.compact)}>
      <div className={styles.weekdays} aria-hidden>
        {WEEKDAY_LABELS.map((label) => (
          <span key={label}>{phone ? label.charAt(0) : label}</span>
        ))}
      </div>
      <div className={styles.grid} style={{ "--weeks": days.length / 7 }}>
        {days.map((day, index) => {
          const dayEvents = byDay[index];
          const hidden = dayEvents.length - MAX_VISIBLE;
          const outside = day.slice(0, 7) !== month;
          const holiday = holidays.get(day);
          const label = `${formatDate(keyToDate(day), "EEEE d 'de' MMMM")}${holiday ? `, feriado: ${holiday.name}` : ""}`;

          if (phone) {
            return (
              <button
                key={day}
                type="button"
                className={cx(styles.cell, outside && styles.outside, holiday && styles.holiday, day === picked && styles.picked)}
                onClick={() => setPicked(day)}
                aria-pressed={day === picked}
                aria-label={`${label}${dayEvents.length ? `, ${dayEvents.length} eventos` : ""}`}
              >
                <span className={cx(styles.number, day === today && styles.today)}>{Number(day.slice(8))}</span>
                <span className={styles.dots} aria-hidden>
                  {dayEvents.slice(0, MAX_VISIBLE).map((event) => (
                    <span key={occurrenceKey(event)} className={styles.dot} style={{ "--event": eventColor(event) }} />
                  ))}
                </span>
              </button>
            );
          }

          return (
            <div
              key={day}
              className={cx(
                styles.cell,
                outside && styles.outside,
                holiday && styles.holiday,
                day === selectedDate && styles.selected,
              )}
              onClick={() => onCreate({ date: day, allDay: true })}
            >
              <button
                type="button"
                className={cx(styles.number, day === today && styles.today)}
                onClick={(event) => {
                  event.stopPropagation();
                  onDayClick(day);
                }}
                aria-label={label}
              >
                {Number(day.slice(8))}
              </button>
              {holiday && (
                <span className={styles.holidayName} title={holiday.name} aria-hidden>
                  {holiday.name}
                </span>
              )}
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
      {phone && pickedIndex !== -1 && (
        <MonthDayAgenda
          key={picked}
          day={picked}
          events={byDay[pickedIndex]}
          holiday={holidays.get(picked)}
          onOpen={onOpen}
          onCreate={onCreate}
        />
      )}
    </div>
  );
}
