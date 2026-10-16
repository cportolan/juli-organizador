import { DEFAULT_THEME, THEME_STORAGE_KEY, applyTheme, normalizeTheme } from "./themeConfig";

// Store externo para el tema: se lee con useSyncExternalStore, así el
// servidor y el primer render del cliente coinciden sin efectos extra.

const listeners = new Set();
let cached = null;

function read() {
  try {
    return normalizeTheme(JSON.parse(localStorage.getItem(THEME_STORAGE_KEY) || "{}"));
  } catch {
    return DEFAULT_THEME;
  }
}

export function getThemeSnapshot() {
  if (!cached) cached = read();
  return cached;
}

export function getServerThemeSnapshot() {
  return DEFAULT_THEME;
}

export function subscribeTheme(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function updateTheme(partial) {
  cached = normalizeTheme({ ...getThemeSnapshot(), ...partial });
  try {
    localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(cached));
  } catch {
    // Sin storage disponible el tema igual se aplica en esta sesión.
  }
  applyTheme(cached);
  listeners.forEach((listener) => listener());
}
