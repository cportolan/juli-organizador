"use client";

import { Monitor, Moon, RotateCcw, Sun } from "lucide-react";
import {
  BODY_FONTS,
  DEFAULT_THEME,
  HEADING_FONTS,
  PRIMARY_PRESETS,
  THEME_MODES,
} from "@/lib/theme/themeConfig";
import { useTheme } from "@/lib/theme/useTheme";
import { useSaveTheme } from "@/features/settings/hooks/useSaveTheme";
import Button from "@/components/ui/Button/Button";
import ColorSwatches from "@/components/ui/ColorSwatches/ColorSwatches";
import SegmentedControl from "@/components/ui/SegmentedControl/SegmentedControl";
import SettingsSection from "../SettingsSection/SettingsSection";
import FontPicker from "../FontPicker/FontPicker";
import ThemePreview from "../ThemePreview/ThemePreview";
import styles from "./ThemeSettings.module.css";

const MODE_ICONS = { light: Sun, dark: Moon, system: Monitor };
const MODE_ITEMS = THEME_MODES.map((mode) => ({ ...mode, icon: MODE_ICONS[mode.id] }));

export default function ThemeSettings() {
  const { theme } = useTheme();
  const setTheme = useSaveTheme();

  return (
    <div className={styles.layout}>
      <div className={styles.sections}>
        <SettingsSection title="Color principal" description="Tiñe botones, selecciones y detalles de toda la app.">
          <ColorSwatches
            label="Color principal"
            options={PRIMARY_PRESETS}
            value={theme.primaryColor}
            onChange={(primaryColor) => setTheme({ primaryColor })}
            allowCustom
          />
        </SettingsSection>

        <SettingsSection title="Modo" description="“Sistema” sigue la configuración de tu dispositivo.">
          <SegmentedControl
            label="Modo de color"
            items={MODE_ITEMS}
            value={theme.themeMode}
            onChange={(themeMode) => setTheme({ themeMode })}
          />
        </SettingsSection>

        <SettingsSection title="Títulos" description="La tipografía de los encabezados.">
          <FontPicker
            label="Tipografía de títulos"
            role="heading"
            sample="Agenda"
            fonts={HEADING_FONTS}
            value={theme.headingFont}
            onChange={(headingFont) => setTheme({ headingFont })}
          />
        </SettingsSection>

        <SettingsSection title="Textos" description="La tipografía del resto de la app.">
          <FontPicker
            label="Tipografía de textos"
            role="body"
            sample="Reunión a las 10"
            fonts={BODY_FONTS}
            value={theme.bodyFont}
            onChange={(bodyFont) => setTheme({ bodyFont })}
          />
        </SettingsSection>

        <div className={styles.reset}>
          <Button variant="ghost" icon={RotateCcw} onClick={() => setTheme(DEFAULT_THEME)}>
            Volver a los valores originales
          </Button>
        </div>
      </div>

      <ThemePreview />
    </div>
  );
}
