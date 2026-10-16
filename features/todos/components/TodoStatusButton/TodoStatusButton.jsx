import { Check } from "lucide-react";
import { cx } from "@/lib/utils/cx";
import styles from "./TodoStatusButton.module.css";

/** Círculo para marcar un pendiente como realizado (o volverlo a pendiente). */
export default function TodoStatusButton({ todo, onToggle, className }) {
  const done = todo.status === "done";
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={done}
      aria-label={done ? `Volver “${todo.title}” a pendiente` : `Marcar “${todo.title}” como realizado`}
      className={cx(styles.button, className)}
      data-done={done}
      onClick={onToggle}
    >
      <Check className={styles.check} strokeWidth={3} aria-hidden />
    </button>
  );
}
