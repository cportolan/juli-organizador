"use client";

import { useRef, useState } from "react";
import { cx } from "@/lib/utils/cx";
import { minutesToTime } from "@/lib/utils/calendar";
import EventBlock from "../EventBlock/EventBlock";
import styles from "./DayColumn.module.css";

const SNAP = 15;
const DEFAULT_DURATION = 60;
const DAY = 24 * 60;
const TAP_TOLERANCE = 8;

const snap = (minutes) => Math.max(0, Math.min(DAY, Math.round(minutes / SNAP) * SNAP));

/**
 * Una columna de día en la grilla horaria. Un clic crea un evento de una hora;
 * arrastrar con el mouse elige el rango.
 */
export default function DayColumn({ dayKey, items, nowMinutes, isToday, onCreate, onOpen }) {
  const [selection, setSelection] = useState(null);
  const drag = useRef(null);

  function minuteAt(event) {
    const rect = event.currentTarget.getBoundingClientRect();
    return ((event.clientY - rect.top) / rect.height) * DAY;
  }

  function handlePointerDown(event) {
    if (event.button !== 0) return;
    const origin = minuteAt(event);
    drag.current = { origin, x: event.clientX, y: event.clientY, moved: false, mouse: event.pointerType === "mouse" };
    if (drag.current.mouse) event.currentTarget.setPointerCapture(event.pointerId);
  }

  function handlePointerMove(event) {
    const current = drag.current;
    if (!current?.mouse) return;
    if (!current.moved && Math.abs(event.clientY - current.y) < TAP_TOLERANCE) return;
    current.moved = true;
    const here = minuteAt(event);
    const start = snap(Math.min(current.origin, here));
    const end = Math.max(start + SNAP, snap(Math.max(current.origin, here)));
    setSelection({ start: Math.floor(start / SNAP) * SNAP, end });
  }

  function handlePointerUp(event) {
    const current = drag.current;
    drag.current = null;
    if (!current) return;
    const movedFar = Math.hypot(event.clientX - current.x, event.clientY - current.y) > TAP_TOLERANCE;
    if (!current.mouse && movedFar) return;

    let range = selection;
    if (!current.moved) {
      const start = Math.min(Math.floor(current.origin / 30) * 30, DAY - DEFAULT_DURATION);
      range = { start, end: start + DEFAULT_DURATION };
    }
    setSelection(null);
    if (range) onCreate({ date: dayKey, start: minutesToTime(range.start), end: minutesToTime(Math.min(range.end, DAY - 1)) });
  }

  return (
    <div
      className={cx(styles.column, isToday && styles.today)}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={() => {
        drag.current = null;
        setSelection(null);
      }}
    >
      {items.map((item) => (
        <EventBlock key={`${item.event.id}:${item.event.occurrenceDate}`} item={item} onOpen={onOpen} />
      ))}
      {selection && (
        <div className={styles.selection} style={{ "--top": selection.start, "--height": selection.end - selection.start }}>
          {minutesToTime(selection.start)} – {minutesToTime(Math.min(selection.end, DAY - 1))}
        </div>
      )}
      {isToday && nowMinutes !== null && <div className={styles.now} style={{ "--top": nowMinutes }} aria-hidden />}
    </div>
  );
}
