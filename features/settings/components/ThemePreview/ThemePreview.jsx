import { Clock } from "lucide-react";
import Badge from "@/components/ui/Badge/Badge";
import Button from "@/components/ui/Button/Button";
import Checkbox from "@/components/ui/Checkbox/Checkbox";
import styles from "./ThemePreview.module.css";

/** Muestra en miniatura de cómo se ven los cambios de tema. */
export default function ThemePreview() {
  return (
    <aside className={styles.preview} aria-label="Vista previa">
      <span className={styles.kicker}>Vista previa</span>
      <h3 className={styles.title}>Martes 14</h3>

      <div className={styles.event}>
        <span className={styles.eventTime}>
          <Clock aria-hidden /> 10:00 – 11:00
        </span>
        <span className={styles.eventTitle}>Reunión de equipo</span>
      </div>

      <ul className={styles.todos}>
        <li>
          <Checkbox label="Mandar el informe" defaultChecked />
        </li>
        <li className={styles.todoRow}>
          <Checkbox label="Llamar a Recursos Humanos" />
          <Badge tone="rose">Alta</Badge>
        </li>
      </ul>

      <Button variant="primary" size="sm" tabIndex={-1}>
        Nuevo evento
      </Button>
    </aside>
  );
}
