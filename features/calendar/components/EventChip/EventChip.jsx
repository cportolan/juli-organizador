import { cx } from "@/lib/utils/cx";
import { timeOf } from "@/lib/utils/calendar";
import { eventColor, eventTypeMeta } from "../eventMeta";
import styles from "./EventChip.module.css";

/** Evento en una línea (vista mensual y fila de "todo el día"). */
export default function EventChip({ event, showTime = true, onOpen }) {
  const filled = event.allDay || !showTime;
  const TypeIcon = event.type === "event" ? null : eventTypeMeta(event.type).icon;

  return (
    <button
      type="button"
      className={cx(styles.chip, filled && styles.filled)}
      style={{ "--event": eventColor(event) }}
      onClick={(click) => {
        click.stopPropagation();
        onOpen(event);
      }}
      onPointerDown={(pointer) => pointer.stopPropagation()}
      title={event.title}
    >
      {!filled && <span className={styles.dot} aria-hidden />}
      {!event.allDay && showTime && <time className={styles.time}>{timeOf(event.startAt)}</time>}
      {TypeIcon && <TypeIcon className={styles.icon} aria-hidden />}
      <span className={styles.title}>{event.title}</span>
    </button>
  );
}
