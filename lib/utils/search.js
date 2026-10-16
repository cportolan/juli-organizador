/** Pasa a minúsculas y saca tildes para comparar sin distinguir "Gómez" de "gomez". */
export function normalizeText(value) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim();
}

/** Separa la búsqueda en palabras ya normalizadas. */
export function searchTerms(query) {
  return normalizeText(query).split(/\s+/).filter(Boolean);
}

/**
 * true si cada palabra de la búsqueda aparece en alguno de los campos.
 * "compras 214" encuentra la fila con oficina "Compras" e interno "2140".
 */
export function matchesSearch(fields, terms) {
  if (!terms.length) return true;
  const haystack = fields.map(normalizeText).join(" ");
  return terms.every((term) => haystack.includes(term));
}

/**
 * Parte un texto en tramos marcando los que coinciden con la búsqueda,
 * para resaltarlos con <mark>. Devuelve [{ text, match }].
 */
export function splitMatches(text, terms) {
  const value = String(text ?? "");
  if (!terms.length || !value) return [{ text: value, match: false }];

  const normalized = normalizeText(value);
  const marks = new Array(value.length).fill(false);
  for (const term of terms) {
    let from = normalized.indexOf(term);
    while (from !== -1) {
      marks.fill(true, from, from + term.length);
      from = normalized.indexOf(term, from + term.length);
    }
  }

  const parts = [];
  for (let index = 0; index < value.length; index++) {
    const last = parts.at(-1);
    if (last && last.match === marks[index]) last.text += value[index];
    else parts.push({ text: value[index], match: marks[index] });
  }
  return parts;
}
