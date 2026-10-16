import { cx } from "@/lib/utils/cx";
import styles from "./EmptyState.module.css";

/** Estado vacío: ícono sobre una forma orgánica, título, texto y acción opcional. */
export default function EmptyState({ icon: Icon, title, description, action, compact = false, className }) {
  return (
    <div className={cx(styles.empty, compact && styles.compact, className)}>
      {Icon && (
        <div className={styles.art} aria-hidden>
          <svg className={styles.blob} viewBox="0 0 120 120">
            <path d="M60 8c19 0 38 9 47 26s7 39-4 56-30 24-48 22S20 99 12 82 5 43 17 27 41 8 60 8Z" />
          </svg>
          <Icon className={styles.icon} strokeWidth={1.6} />
        </div>
      )}
      <h3 className={styles.title}>{title}</h3>
      {description && <p className={styles.description}>{description}</p>}
      {action && <div className={styles.action}>{action}</div>}
    </div>
  );
}
