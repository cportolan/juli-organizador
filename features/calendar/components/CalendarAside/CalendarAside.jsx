"use client";

import { NotebookPen } from "lucide-react";
import RightSidebar from "@/components/layout/RightSidebar/RightSidebar";
import { useCalendarNavigation } from "../../hooks/useCalendarNavigation";
import DayNotePanel from "../DayNotePanel/DayNotePanel";
import CalendarTodos from "../CalendarTodos/CalendarTodos";
import styles from "./CalendarAside.module.css";

/** Panel derecho del calendario: la nota del día elegido y los pendientes. */
export default function CalendarAside({ state, today, note, todos, categories }) {
  const nav = useCalendarNavigation(state);

  return (
    <RightSidebar title="Tu día" storageKey="oj-calendar-aside" fabIcon={NotebookPen}>
      <div className={styles.aside}>
        <DayNotePanel date={state.date} today={today} note={note} onDateChange={(date) => nav.go({ date })} />
        <CalendarTodos initialTodos={todos} categories={categories} />
      </div>
    </RightSidebar>
  );
}
