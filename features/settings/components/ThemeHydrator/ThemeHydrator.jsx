"use client";

import { useEffect } from "react";
import { normalizeTheme } from "@/lib/theme/themeConfig";
import { getThemeSnapshot, updateTheme } from "@/lib/theme/themeStore";

const THEME_KEYS = ["primaryColor", "themeMode", "headingFont", "bodyFont"];

/**
 * Aplica el tema guardado en Supabase (fuente de verdad) sobre el que
 * está cacheado en el navegador, solo si cambió.
 */
export default function ThemeHydrator({ settings }) {
  useEffect(() => {
    const saved = normalizeTheme(settings);
    const current = getThemeSnapshot();
    if (THEME_KEYS.some((key) => saved[key] !== current[key])) updateTheme(saved);
  }, [settings]);

  return null;
}
