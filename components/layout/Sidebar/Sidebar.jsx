"use client";

import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { cx } from "@/lib/utils/cx";
import { MAIN_NAV, SETTINGS_NAV } from "@/lib/navigation";
import SignOutControl from "@/features/auth/components/SignOutControl/SignOutControl";
import IconButton from "@/components/ui/IconButton/IconButton";
import SidebarNavList from "./SidebarNavList";
import SidebarToday from "./SidebarToday";
import ThemeQuickToggle from "./ThemeQuickToggle";
import styles from "./Sidebar.module.css";

/** Navegación de escritorio. En el celular la reemplaza la barra de pestañas (TabBar). */
export default function Sidebar({ collapsed, onToggleCollapsed }) {
  return (
    <aside className={cx(styles.sidebar, collapsed && styles.collapsed)}>
      <div className={styles.top}>
        <div className={styles.brand}>
          <span className={styles.mark} aria-hidden>
            J
          </span>
          <span className={styles.brandText}>
            <span className={styles.brandKicker}>Organizador</span>
            <span className={styles.brandName}>Juli</span>
          </span>
        </div>
      </div>

      <SidebarToday collapsed={collapsed} />

      <nav aria-label="Secciones" className={styles.nav}>
        <SidebarNavList items={MAIN_NAV} collapsed={collapsed} />
      </nav>

      <div className={styles.bottom}>
        <SidebarNavList items={[SETTINGS_NAV]} collapsed={collapsed} />
        <div className={styles.actions}>
          <ThemeQuickToggle />
          <SignOutControl />
          <IconButton
            icon={collapsed ? PanelLeftOpen : PanelLeftClose}
            label={collapsed ? "Expandir menú" : "Achicar menú"}
            tooltipSide="right"
            className={styles.collapseButton}
            onClick={onToggleCollapsed}
          />
        </div>
      </div>
    </aside>
  );
}
