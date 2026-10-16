"use client";

import { useState } from "react";
import { Menu } from "lucide-react";
import { cx } from "@/lib/utils/cx";
import { MOBILE_QUERY, useMediaQuery } from "@/lib/hooks/useMediaQuery";
import { useStoredState } from "@/lib/hooks/useStoredState";
import IconButton from "@/components/ui/IconButton/IconButton";
import Sidebar from "@/components/layout/Sidebar/Sidebar";
import styles from "./AppShell.module.css";

/** Estructura de la app autenticada: sidebar + contenido. */
export default function AppShell({ children }) {
  const isMobile = useMediaQuery(MOBILE_QUERY);
  const [collapsedPref, setCollapsedPref] = useStoredState("oj-sidebar-collapsed", false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const collapsed = collapsedPref && !isMobile;

  return (
    <div className={styles.shell}>
      <Sidebar
        collapsed={collapsed}
        onToggleCollapsed={() => setCollapsedPref((value) => !value)}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />

      <div
        className={cx(styles.scrim, mobileOpen && styles.scrimVisible)}
        aria-hidden
        onClick={() => setMobileOpen(false)}
      />

      <div className={styles.main}>
        <header className={styles.topbar}>
          <IconButton icon={Menu} label="Abrir menú" tooltip={false} onClick={() => setMobileOpen(true)} />
          <span className={styles.topbarTitle}>Juli</span>
        </header>
        <main className={styles.content}>{children}</main>
      </div>
    </div>
  );
}
