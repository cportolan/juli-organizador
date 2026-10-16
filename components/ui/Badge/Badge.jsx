import { cx } from "@/lib/utils/cx";
import { toneVar } from "@/lib/utils/tones";
import styles from "./Badge.module.css";

/**
 * Etiqueta chica de color. `tone` es un id de TONES (lib/utils/tones) o "neutral".
 * `color` acepta un color libre (por ejemplo el hex de una categoría) y pisa a `tone`.
 * Con `dot` muestra un punto de color en vez de fondo.
 */
export default function Badge({ tone = "neutral", color, dot = false, icon: Icon, className, children }) {
  const neutral = !color && tone === "neutral";
  const style = neutral ? undefined : { "--tone": color ?? toneVar(tone) };

  return (
    <span className={cx(styles.badge, neutral && styles.neutral, dot && styles.dot, className)} style={style}>
      {dot && <span className={styles.dotMark} aria-hidden />}
      {Icon && <Icon className={styles.icon} aria-hidden />}
      {children}
    </span>
  );
}
