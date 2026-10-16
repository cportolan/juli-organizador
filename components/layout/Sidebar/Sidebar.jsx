"use client";

import { useRouter } from "next/navigation";
import { LogOut, PanelLeftClose, PanelLeftOpen, X } from "lucide-react";
import { cx } from "@/lib/utils/cx";
import { MAIN_NAV, SETTINGS_NAV } from "@/lib/navigation";
import { signOut } from "@/features/auth/actions";
import { useToast } from "@/components/ui/Toast/Toast";
import IconButton from "@/components/ui/IconButton/IconButton";
import SidebarNavList from "./SidebarNavList";
import SidebarToday from "./SidebarToday";
import ThemeQuickToggle from "./ThemeQuickToggle";
import styles from "./Sidebar.module.css";

export default function Sidebar({ collapsed, onToggleCollapsed, mobileOpen, onCloseMobile }) {
  const router = useRouter();
  const toast = useToast();

  async function handleSignOut() {
    const result = await signOut();
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    router.replace("/login");
    router.refresh();
  }

  return (
    <aside className={cx(styles.sidebar, collapsed && styles.collapsed, mobileOpen && styles.mobileOpen)}>
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
        <IconButton icon={X} label="Cerrar menú" className={styles.mobileClose} tooltip={false} onClick={onCloseMobile} />
      </div>

      <SidebarToday collapsed={collapsed} />

      <nav aria-label="Secciones" className={styles.nav}>
        <SidebarNavList items={MAIN_NAV} collapsed={collapsed} onNavigate={onCloseMobile} />
      </nav>

      <div className={styles.bottom}>
        <SidebarNavList items={[SETTINGS_NAV]} collapsed={collapsed} onNavigate={onCloseMobile} />
        <div className={styles.actions}>
          <ThemeQuickToggle />
          <IconButton icon={LogOut} label="Cerrar sesión" tooltipSide="right" onClick={handleSignOut} />
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
