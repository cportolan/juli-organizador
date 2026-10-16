import { CalendarDays, ListTodo } from "lucide-react";
import Page from "@/components/layout/Page/Page";
import RightSidebar from "@/components/layout/RightSidebar/RightSidebar";
import EmptyState from "@/components/ui/EmptyState/EmptyState";

export const metadata = { title: "Calendario" };

export default function CalendarPage() {
  return (
    <Page
      title="Calendario"
      wide
      aside={
        <RightSidebar title="Pendientes" storageKey="oj-calendar-todos">
          <EmptyState compact icon={ListTodo} title="Sin pendientes" description="Lo que anotes en Pendientes aparece acá." />
        </RightSidebar>
      }
    >
      <EmptyState
        icon={CalendarDays}
        title="El calendario está en camino"
        description="Vistas de mes, semana y día, eventos que se repiten y el anotador de cada día."
      />
    </Page>
  );
}
