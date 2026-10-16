"use client";

import { useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { formatDate } from "@/lib/utils/dates";
import { addDaysToKey, keyToDate } from "@/lib/utils/calendar";
import { useAutosave } from "@/lib/hooks/useAutosave";
import { saveDayNote } from "@/features/calendar/actions";
import IconButton from "@/components/ui/IconButton/IconButton";
import RichTextEditor from "@/components/ui/RichTextEditor/RichTextEditor";
import SaveStatus from "@/components/ui/SaveStatus/SaveStatus";
import styles from "./DayNotePanel.module.css";

/** Anotador libre del día elegido en el calendario. */
export default function DayNotePanel({ date, today, note, onDateChange }) {
  const label = date === today ? "Hoy" : formatDate(keyToDate(date), "EEEE d MMM").replace(".", "");

  return (
    <section className={styles.panel} aria-labelledby="day-note-title">
      <header className={styles.header}>
        <div>
          <h3 id="day-note-title" className={styles.title}>
            Nota del día
          </h3>
          <p className={styles.date}>{label}</p>
        </div>
        <div className={styles.nav}>
          <IconButton icon={ChevronLeft} label="Día anterior" size="sm" onClick={() => onDateChange(addDaysToKey(date, -1))} />
          <IconButton icon={ChevronRight} label="Día siguiente" size="sm" onClick={() => onDateChange(addDaysToKey(date, 1))} />
        </div>
      </header>
      {/* La key hace que, al cambiar de día, se guarde lo pendiente y se arranque de cero */}
      <DayNoteEditor key={date} date={date} content={note?.content ?? null} />
    </section>
  );
}

function DayNoteEditor({ date, content }) {
  const save = useCallback((value) => saveDayNote({ date, content: value }).catch(() => ({ ok: false })), [date]);
  const { schedule, status } = useAutosave(save);

  return (
    <div className={styles.editor}>
      <RichTextEditor
        variant="compact"
        content={content}
        onChange={schedule}
        placeholder="Qué pasó hoy, qué quedó pendiente…"
        label="Nota del día"
      />
      <SaveStatus status={status} className={styles.status} />
    </div>
  );
}
