import Page from "@/components/layout/Page/Page";
import ThemeSettings from "@/features/settings/components/ThemeSettings/ThemeSettings";

export const metadata = { title: "Configuración" };

export default function SettingsPage() {
  return (
    <Page title="Configuración" description="Colores, modo y tipografías. Los cambios se aplican al instante.">
      <ThemeSettings />
    </Page>
  );
}
