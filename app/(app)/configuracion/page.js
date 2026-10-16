import { Suspense } from "react";
import Page from "@/components/layout/Page/Page";
import Skeleton from "@/components/ui/Skeleton/Skeleton";
import ThemeSettings from "@/features/settings/components/ThemeSettings/ThemeSettings";
import PeoplePasswordLoader from "@/features/settings/components/PeoplePasswordLoader/PeoplePasswordLoader";
import styles from "./page.module.css";

export const metadata = { title: "Configuración" };

export default function SettingsPage() {
  return (
    <Page title="Configuración" description="Colores, tipografías y privacidad. Los cambios se aplican al instante.">
      <ThemeSettings />
      <div className={styles.privacy}>
        <Suspense fallback={<Skeleton width={320} height={96} radius="var(--radius-md)" />}>
          <PeoplePasswordLoader />
        </Suspense>
      </div>
    </Page>
  );
}
