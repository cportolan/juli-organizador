"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/lib/theme/useTheme";
import IconButton from "@/components/ui/IconButton/IconButton";
import styles from "./Sidebar.module.css";

// El ícono se elige por CSS según html[data-theme], así no depende
// del estado de React y no hay diferencias entre servidor y cliente.
function ThemeIcon({ className }) {
  return (
    <span className={`${className} ${styles.themeIcon}`}>
      <Moon className={styles.themeIconLight} />
      <Sun className={styles.themeIconDark} />
    </span>
  );
}

/** Alterna claro/oscuro desde el sidebar (el detalle está en Configuración). */
export default function ThemeQuickToggle() {
  const { setTheme } = useTheme();

  function toggle() {
    const isDark = document.documentElement.dataset.theme === "dark";
    setTheme({ themeMode: isDark ? "light" : "dark" });
  }

  return <IconButton icon={ThemeIcon} label="Cambiar tema" tooltipSide="right" onClick={toggle} />;
}
