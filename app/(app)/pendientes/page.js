import { ListTodo } from "lucide-react";
import Page from "@/components/layout/Page/Page";
import EmptyState from "@/components/ui/EmptyState/EmptyState";

export const metadata = { title: "Pendientes" };

export default function TodosPage() {
  return (
    <Page title="Pendientes">
      <EmptyState
        icon={ListTodo}
        title="Los pendientes están en camino"
        description="Columnas, tabla o lista, con categorías propias, prioridades y filtros."
      />
    </Page>
  );
}
