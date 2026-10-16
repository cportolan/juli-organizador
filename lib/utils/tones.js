/**
 * Tonos pastel disponibles para categorías, eventos y etiquetas (ver --tone-* en globals.css).
 * `hex` es el mismo valor que la variable CSS: se usa cuando el color se guarda
 * en la base (categorías, eventos), que admite colores libres.
 */
export const TONES = [
  { id: "sage", label: "Salvia", hex: "#a9cdb0" },
  { id: "peach", label: "Durazno", hex: "#f4bfa6" },
  { id: "sky", label: "Cielo", hex: "#abcbea" },
  { id: "rose", label: "Rosa", hex: "#f0b6c8" },
  { id: "butter", label: "Manteca", hex: "#eed691" },
  { id: "lilac", label: "Lila", hex: "#c6badf" },
  { id: "mint", label: "Menta", hex: "#a6dbd2" },
  { id: "sand", label: "Arena", hex: "#dcc9ad" },
];

/** Opciones para ColorSwatches cuando el color se guarda como hex. */
export const TONE_SWATCHES = TONES.map(({ id, label, hex }) => ({ id, label, value: hex }));

/** Devuelve el valor CSS de un tono, o el primario si no existe. */
export function toneVar(tone) {
  return TONES.some((item) => item.id === tone) ? `var(--tone-${tone})` : "var(--primary)";
}
