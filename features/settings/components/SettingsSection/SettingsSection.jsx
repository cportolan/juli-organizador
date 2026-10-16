import styles from "./SettingsSection.module.css";

/** Fila de configuración: título y explicación a la izquierda, control a la derecha. */
export default function SettingsSection({ title, description, children }) {
  return (
    <section className={styles.section}>
      <div className={styles.text}>
        <h2 className={styles.title}>{title}</h2>
        {description && <p className={styles.description}>{description}</p>}
      </div>
      <div className={styles.control}>{children}</div>
    </section>
  );
}
