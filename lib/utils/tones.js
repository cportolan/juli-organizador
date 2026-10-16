/** Tonos pastel disponibles para categorías, eventos y etiquetas (ver --tone-* en globals.css). */
export const TONES = [
  { id: "sage", label: "Salvia" },
  { id: "peach", label: "Durazno" },
  { id: "sky", label: "Cielo" },
  { id: "rose", label: "Rosa" },
  { id: "butter", label: "Manteca" },
  { id: "lilac", label: "Lila" },
  { id: "mint", label: "Menta" },
  { id: "sand", label: "Arena" },
];

/** Devuelve el valor CSS de un tono, o el primario si no existe. */
export function toneVar(tone) {
  return TONES.some((item) => item.id === tone) ? `var(--tone-${tone})` : "var(--primary)";
}
