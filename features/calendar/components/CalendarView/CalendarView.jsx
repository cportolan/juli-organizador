"use client";

import { useEffect, useMemo } from "react";
import { cx } from "@/lib/utils/cx";
import { addDaysToKey, combineDateTime, dayStartIso, minutesToTime, periodLabel, stepDate } from "@/lib/utils/calendar";
import { useNow } from "@/lib/hooks/useNow";
import { useStoredState } from "@/lib/hooks/useStoredState";
import { useCalendarNavigation } from "../../hooks/useCalendarNavigation";
import { useEventEditor } from "../../hooks/useEventEditor";
import CalendarToolbar from "../CalendarToolbar/CalendarToolbar";
import MonthView from "../MonthView/MonthView";
import TimeGrid from "../TimeGrid/TimeGrid";
import AgendaColumns from "../AgendaColumns/AgendaColumns";
import EventFormModal from "../EventFormModal/EventFormModal";
import ScopeDialog from "../ScopeDialog/ScopeDialog";
import styles from "./CalendarView.module.css";

function isTyping(target) {
  return target.closest("input, textarea, select, [contenteditable='true'], dialog");
}

/** El calendario: barra, vista elegida y edición de eventos. */
export default function CalendarView({ state, today, days, events, holidays = [] }) {
  const nav = useCalendarNavigation(state);
  const editor = useEventEditor({ onDone: nav.refresh });
  const now = useNow();
  const [layout, setLayout] = useStoredState("oj-calendar-layout", "tarjetas");
  const label = useMemo(() => {
    const text = periodLabel(state, days);
    return text.charAt(0).toUpperCase() + text.slice(1);
  }, [state, days]);

  const holidaysByDay = useMemo(() => new Map(holidays.map((holiday) => [holiday.date, holiday])), [holidays]);

  const isCurrent = days.includes(today) && (state.view !== "dia" || state.date === today);

  function createAt({ date, start, end, allDay = false }) {
    if (allDay) {
      editor.openNew({ allDay: true, startAt: dayStartIso(date), endAt: dayStartIso(addDaysToKey(date, 1)) });
      return;
    }
    editor.openNew({ allDay: false, startAt: combineDateTime(date, start), endAt: combineDateTime(date, end) });
  }

  function createNew() {
    // Por defecto, la próxima hora en punto si es hoy; si no, a las 9.
    const date = state.date;
    let startMinutes = 9 * 60;
    if (date === today && now !== null) {
      const current = new Date(now);
      startMinutes = Math.min((current.getHours() + 1) * 60, 23 * 60);
    }
    createAt({ date, start: minutesToTime(startMinutes), end: minutesToTime(startMinutes + 60) });
  }

  useEffect(() => {
    function handleKey(event) {
      if (event.metaKey || event.ctrlKey || event.altKey || isTyping(event.target)) return;
      if (event.key === "t") nav.go({ date: today });
      else if (event.key === "ArrowLeft") nav.go({ date: stepDate(state, -1) });
      else if (event.key === "ArrowRight") nav.go({ date: stepDate(state, 1) });
      else return;
      event.preventDefault();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [nav, state, today]);

  const viewProps = {
    days,
    events,
    holidays: holidaysByDay,
    today,
    selectedDate: state.date,
    onCreate: createAt,
    onOpen: editor.openEvent,
    onDayClick: (day) => nav.go({ view: "dia", date: day }),
  };

  return (
    <div className={styles.calendar}>
      <CalendarToolbar
        state={state}
        label={label}
        pending={nav.pending}
        isCurrent={isCurrent}
        layout={layout}
        onLayout={setLayout}
        onToday={() => nav.go({ date: today })}
        onStep={(direction) => nav.go({ date: stepDate(state, direction) })}
        onView={(view) => nav.go({ view })}
        onDays={(count) => nav.go({ view: "semana", days: count })}
        onNew={createNew}
      />

      <div key={`${state.view}:${layout}:${days[0]}:${days.length}`} className={cx(styles.view, nav.pending && styles.pending)}>
        {state.view === "mes" ? (
          <MonthView {...viewProps} month={state.date.slice(0, 7)} />
        ) : layout === "tarjetas" ? (
          <AgendaColumns {...viewProps} />
        ) : (
          <TimeGrid {...viewProps} />
        )}
      </div>

      <EventFormModal
        editing={editor.editing}
        saving={editor.saving}
        deleting={editor.deleting && !editor.scopeRequest}
        onClose={editor.close}
        onSave={editor.save}
        onDelete={editor.remove}
      />
      <ScopeDialog
        request={editor.scopeRequest}
        loading={editor.saving || editor.deleting}
        onCancel={editor.cancelScope}
        onConfirm={editor.confirmScope}
      />
    </div>
  );
}
