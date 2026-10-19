"use client";

import { useLayoutEffect, useMemo, useRef } from "react";
import { cx } from "@/lib/utils/cx";
import { formatDate, toDateKey } from "@/lib/utils/dates";
import { eventsOnDay, isAllDayLike, keyToDate, layoutDayEvents, minutesOfDay, occurrenceKey } from "@/lib/utils/calendar";
import { useNow } from "@/lib/hooks/useNow";
import DayColumn from "../DayColumn/DayColumn";
import EventChip from "../EventChip/EventChip";
import styles from "./TimeGrid.module.css";

const HOURS = Array.from({ length: 24 }, (_, hour) => hour);
const DEFAULT_SCROLL_HOUR = 8;

/** Vista de semana (7, 5 o 3 días) y de día: fila de "todo el día" y grilla horaria. */
export default function TimeGrid({ days, events, holidays, today, selectedDate, onCreate, onOpen, onDayClick }) {
  const scrollerRef = useRef(null);
  const now = useNow();
  const nowMinutes = now === null ? null : minutesOfDay(new Date(now).toISOString());

  const { allDay, timed } = useMemo(() => {
    const allDayEvents = events.filter(isAllDayLike);
    const timedEvents = events.filter((event) => !isAllDayLike(event));
    return {
      allDay: days.map((day) => eventsOnDay(allDayEvents, day)),
      timed: days.map((day) => layoutDayEvents(timedEvents.filter((event) => toDateKey(event.startAt) === day))),
    };
  }, [days, events]);

  // Al abrir, la grilla arranca en el primer evento visible, o a las 8 (o una
  // hora antes de ahora, si hoy está en la vista). Lo que pase primero.
  const firstHour = useMemo(() => {
    const starts = timed.flat().map((item) => item.top / 60);
    if (days.includes(today) && nowMinutes !== null) starts.push(nowMinutes / 60 - 1);
    return Math.max(0, Math.min(DEFAULT_SCROLL_HOUR, ...starts) - 0.5);
  }, [timed, days, today, nowMinutes]);
  const scrolled = useRef(false);

  useLayoutEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller || scrolled.current || nowMinutes === null) return;
    scrolled.current = true;
    scroller.scrollTop = firstHour * (scroller.scrollHeight / 24);
  }, [firstHour, nowMinutes]);

  const hasAllDay = allDay.some((list) => list.length) || days.some((day) => holidays.has(day));

  return (
    <div className={styles.grid} style={{ "--days": days.length }}>
      <div className={styles.head}>
        <div className={styles.gutter} />
        {days.map((day) => {
          const date = keyToDate(day);
          return (
            <button
              key={day}
              type="button"
              className={cx(
                styles.dayHead,
                holidays.has(day) && styles.isHoliday,
                day === today && styles.isToday,
                day === selectedDate && styles.isSelected,
              )}
              onClick={() => onDayClick(day)}
              aria-label={`${formatDate(date, "EEEE d 'de' MMMM")}${holidays.has(day) ? `, feriado: ${holidays.get(day).name}` : ""}`}
            >
              <span className={styles.weekday}>{formatDate(date, "EEE").replace(".", "")}</span>
              <span className={styles.dayNumber}>{formatDate(date, "d")}</span>
            </button>
          );
        })}
      </div>

      <div className={cx(styles.allDay, hasAllDay && styles.hasAllDay)}>
        <div className={styles.gutterLabel}>todo el día</div>
        {days.map((day, index) => (
          <div
            key={day}
            className={styles.allDayCell}
            onClick={() => onCreate({ date: day, allDay: true })}
          >
            {holidays.has(day) && (
              <span className={styles.holiday} title={holidays.get(day).name}>
                {holidays.get(day).name}
              </span>
            )}
            {allDay[index].map((event) => (
              <EventChip key={occurrenceKey(event)} event={event} showTime={false} onOpen={onOpen} />
            ))}
          </div>
        ))}
      </div>

      <div ref={scrollerRef} className={styles.scroller}>
        <div className={styles.body}>
          <div className={styles.hours} aria-hidden>
            {HOURS.map((hour) => (
              <span key={hour} className={styles.hour}>
                {hour === 0 ? "" : `${String(hour).padStart(2, "0")}:00`}
              </span>
            ))}
          </div>
          {days.map((day, index) => (
            <DayColumn
              key={day}
              dayKey={day}
              items={timed[index]}
              isToday={day === today}
              nowMinutes={nowMinutes}
              onCreate={onCreate}
              onOpen={onOpen}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
