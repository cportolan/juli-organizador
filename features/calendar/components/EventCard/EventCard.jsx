import { MapPin } from "lucide-react";
import { isAllDayLike, timeOf } from "@/lib/utils/calendar";
import { eventColor, eventTypeMeta } from "../eventMeta";
import styles from "./EventCard.module.css";

/** Evento como tarjeta (vista de tarjetas por día): horario, título y lugar. */
export default function EventCard({ event, onOpen }) {
  const TypeIcon = event.type === "event" ? null : eventTypeMeta(event.type).icon;
  const allDay = isAllDayLike(event);

  return (
    <button type="button" className={styles.card} style={{ "--event": eventColor(event) }} onClick={() => onOpen(event)}>
      <span className={styles.time}>
        {allDay ? "Todo el día" : `${timeOf(event.startAt)} – ${timeOf(event.endAt)}`}
      </span>
      <span className={styles.title}>
        {TypeIcon && <TypeIcon className={styles.icon} aria-hidden />}
        {event.title}
      </span>
      {event.location && (
        <span className={styles.location}>
          <MapPin className={styles.icon} aria-hidden />
          {event.location}
        </span>
      )}
    </button>
  );
}
