"use client";

import { ListTodo } from "lucide-react";
import RightSidebar from "@/components/layout/RightSidebar/RightSidebar";
import Button from "@/components/ui/Button/Button";
import CalendarTodos from "../CalendarTodos/CalendarTodos";
import styles from "./CalendarAside.module.css";

/** Panel derecho del calendario: los pendientes, de a una categoría. */
export default function CalendarAside({ todos, categories }) {
  return (
    <RightSidebar
      title="Pendientes"
      storageKey="oj-calendar-aside"
      fabIcon={ListTodo}
      actions={
        <Button href="/pendientes" variant="ghost" size="sm">
          Ver todos
        </Button>
      }
    >
      <div className={styles.aside}>
        <CalendarTodos initialTodos={todos} categories={categories} />
      </div>
    </RightSidebar>
  );
}
