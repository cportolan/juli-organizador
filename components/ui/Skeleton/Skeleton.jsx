import { cx } from "@/lib/utils/cx";
import styles from "./Skeleton.module.css";

/** Bloque de carga. Tamaño con width/height (número = px). */
export default function Skeleton({ width = "100%", height = 16, radius, className }) {
  return (
    <span
      aria-hidden
      className={cx(styles.skeleton, className)}
      style={{ width, height, borderRadius: radius }}
    />
  );
}
