"use client";

import { useEffect, useSyncExternalStore } from "react";
import { applyTheme } from "./themeConfig";
import { getServerThemeSnapshot, getThemeSnapshot, subscribeTheme, updateTheme } from "./themeStore";

export function useTheme() {
  const theme = useSyncExternalStore(subscribeTheme, getThemeSnapshot, getServerThemeSnapshot);
  return { theme, setTheme: updateTheme };
}

/** Mantiene el tema aplicado y sigue al sistema cuando el modo es "Sistema". */
export function useThemeSync() {
  const { theme } = useTheme();

  useEffect(() => {
    applyTheme(theme);
    if (theme.themeMode !== "system") return;

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => applyTheme(theme);
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, [theme]);
}
