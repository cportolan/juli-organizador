import { Phone } from "lucide-react";
import Page from "@/components/layout/Page/Page";
import EmptyState from "@/components/ui/EmptyState/EmptyState";

export const metadata = { title: "Teléfonos" };

export default function PhonesPage() {
  return (
    <Page title="Teléfonos" description="Oficinas, agentes e internos.">
      <EmptyState
        icon={Phone}
        title="La agenda de internos está en camino"
        description="Una tabla con búsqueda en todos los campos."
      />
    </Page>
  );
}
