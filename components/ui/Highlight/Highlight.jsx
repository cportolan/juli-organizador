import { splitMatches } from "@/lib/utils/search";
import styles from "./Highlight.module.css";

/** Resalta en el texto las palabras buscadas. `terms` sale de searchTerms(). */
export default function Highlight({ text, terms }) {
  return splitMatches(text, terms).map((part, index) =>
    part.match ? (
      <mark key={index} className={styles.mark}>
        {part.text}
      </mark>
    ) : (
      part.text
    ),
  );
}
