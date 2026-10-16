export const THEME_STORAGE_KEY = "oj-theme";

export const PRIMARY_PRESETS = [
  { id: "salvia", label: "Salvia", value: "#9dc3a5" },
  { id: "durazno", label: "Durazno", value: "#f2b9a0" },
  { id: "cielo", label: "Cielo", value: "#a7c6e6" },
  { id: "rosa", label: "Rosa", value: "#eeb3c6" },
  { id: "manteca", label: "Manteca", value: "#ecd28c" },
  { id: "glicina", label: "Glicina", value: "#bfb3e2" },
];

export const HEADING_FONTS = [
  { id: "lora", label: "Lora" },
  { id: "fraunces", label: "Fraunces" },
  { id: "playfair", label: "Playfair Display" },
  { id: "dm-serif", label: "DM Serif Display" },
];

export const BODY_FONTS = [
  { id: "roboto", label: "Roboto" },
  { id: "inter", label: "Inter" },
  { id: "nunito", label: "Nunito" },
  { id: "dm-sans", label: "DM Sans" },
];

export const THEME_MODES = [
  { id: "light", label: "Claro" },
  { id: "dark", label: "Oscuro" },
  { id: "system", label: "Sistema" },
];

export const DEFAULT_THEME = {
  primaryColor: PRIMARY_PRESETS[0].value,
  themeMode: "system",
  headingFont: HEADING_FONTS[0].id,
  bodyFont: BODY_FONTS[0].id,
};

const HEX_COLOR = /^#[0-9a-f]{6}$/i;

/** Mezcla lo guardado con los valores por defecto, descartando valores inválidos. */
export function normalizeTheme(raw = {}) {
  const pick = (value, options, fallback) =>
    options.some((option) => option.id === value) ? value : fallback;

  return {
    primaryColor: HEX_COLOR.test(raw.primaryColor) ? raw.primaryColor : DEFAULT_THEME.primaryColor,
    themeMode: pick(raw.themeMode, THEME_MODES, DEFAULT_THEME.themeMode),
    headingFont: pick(raw.headingFont, HEADING_FONTS, DEFAULT_THEME.headingFont),
    bodyFont: pick(raw.bodyFont, BODY_FONTS, DEFAULT_THEME.bodyFont),
  };
}

export function resolveThemeMode(mode) {
  if (mode !== "system") return mode;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function applyTheme(theme) {
  const root = document.documentElement;
  root.dataset.theme = resolveThemeMode(theme.themeMode);
  root.dataset.headingFont = theme.headingFont;
  root.dataset.bodyFont = theme.bodyFont;
  root.style.setProperty("--primary", theme.primaryColor);
}

/**
 * Script inline que aplica el tema guardado antes del primer pintado,
 * para evitar el parpadeo de colores al cargar.
 */
export const themeInitScript = `(function(){try{
var d=${JSON.stringify(DEFAULT_THEME)};
var s=JSON.parse(localStorage.getItem(${JSON.stringify(THEME_STORAGE_KEY)})||"{}");
var t=Object.assign({},d,s);
var m=t.themeMode==="system"?(matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"):t.themeMode;
var r=document.documentElement;
r.dataset.theme=m;r.dataset.headingFont=t.headingFont;r.dataset.bodyFont=t.bodyFont;
if(/^#[0-9a-f]{6}$/i.test(t.primaryColor))r.style.setProperty("--primary",t.primaryColor);
}catch(e){}})()`;
