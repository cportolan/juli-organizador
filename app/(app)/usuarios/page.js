import { BookUser } from "lucide-react";
import Page from "@/components/layout/Page/Page";
import EmptyState from "@/components/ui/EmptyState/EmptyState";

export const metadata = { title: "Usuarios" };

export default function PeoplePage() {
  return (
    <Page title="Usuarios" description="Fichas con notas y adjuntos de cada persona.">
      <EmptyState
        icon={BookUser}
        title="Las fichas están en camino"
        description="Una pestaña por persona, con editor de texto, adjuntos y contraseña opcional."
      />
    </Page>
  );
}
