"use client";

import { MOBILE_QUERY, useMediaQuery } from "@/lib/hooks/useMediaQuery";
import { useStoredState } from "@/lib/hooks/useStoredState";
import Sidebar from "@/components/layout/Sidebar/Sidebar";
import TabBar from "@/components/layout/TabBar/TabBar";
import styles from "./AppShell.module.css";

/** Estructura de la app autenticada: sidebar (escritorio) o pestañas abajo (celular) + contenido. */
export default function AppShell({ children }) {
  const isMobile = useMediaQuery(MOBILE_QUERY);
  const [collapsedPref, setCollapsedPref] = useStoredState("oj-sidebar-collapsed", false);
  const collapsed = collapsedPref && !isMobile;

  return (
    <div className={styles.shell}>
      <Sidebar collapsed={collapsed} onToggleCollapsed={() => setCollapsedPref((value) => !value)} />
      <div className={styles.main}>
        <main className={styles.content}>{children}</main>
      </div>
      <TabBar />
    </div>
  );
}
