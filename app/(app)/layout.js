import { Suspense } from "react";
import AppShell from "@/components/layout/AppShell/AppShell";
import ThemeLoader from "@/features/settings/components/ThemeHydrator/ThemeLoader";

export default function AppLayout({ children }) {
  return (
    <AppShell>
      {children}
      <Suspense fallback={null}>
        <ThemeLoader />
      </Suspense>
    </AppShell>
  );
}
