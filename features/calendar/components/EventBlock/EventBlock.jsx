import { cx } from "@/lib/utils/cx";
import { timeOf } from "@/lib/utils/calendar";
import { eventColor, eventTypeMeta } from "../eventMeta";
import styles from "./EventBlock.module.css";

/** Evento con hora en la grilla de semana/día. Posición en minutos (ver layoutDayEvents). */
export default function EventBlock({ item, onOpen }) {
  const { event, top, height, column, columns } = item;
  const TypeIcon = event.type === "event" ? null : eventTypeMeta(event.type).icon;
  const short = height < 40;

  return (
    <button
      type="button"
      className={cx(styles.block, short && styles.short)}
      style={{
        "--event": eventColor(event),
        "--top": top,
        "--height": height,
        "--column": column,
        "--columns": columns,
      }}
      onClick={() => onOpen(event)}
      onPointerDown={(pointer) => pointer.stopPropagation()}
    >
      <span className={styles.title}>
        {TypeIcon && <TypeIcon className={styles.icon} aria-hidden />}
        {event.title}
      </span>
      <span className={styles.meta}>
        {timeOf(event.startAt)} – {timeOf(event.endAt)}
        {event.location && !short ? ` · ${event.location}` : ""}
      </span>
    </button>
  );
}
