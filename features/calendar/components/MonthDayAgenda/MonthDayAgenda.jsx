import { Plus } from "lucide-react";
import { capitalize } from "@/lib/utils/format";
import { formatDate } from "@/lib/utils/dates";
import { keyToDate, nextFreeSlot, occurrenceKey } from "@/lib/utils/calendar";
import EventCard from "../EventCard/EventCard";
import styles from "./MonthDayAgenda.module.css";

/** Debajo del mes (en el teléfono): los eventos del día tocado y un atajo para agregar. */
export default function MonthDayAgenda({ day, events, holiday, onOpen, onCreate }) {
  const count = events.length;

  return (
    <section className={styles.agenda} aria-live="polite">
      <header className={styles.header}>
        <h3 className={styles.title}>{capitalize(formatDate(keyToDate(day), "EEEE d"))}</h3>
        <span className={styles.meta}>{count === 0 ? "Libre" : count === 1 ? "1 evento" : `${count} eventos`}</span>
      </header>
      {holiday && <p className={styles.holiday}>Feriado · {holiday.name}</p>}
      {count > 0 && (
        <ul className={styles.list}>
          {events.map((event) => (
            <li key={occurrenceKey(event)}>
              <EventCard event={event} onOpen={onOpen} />
            </li>
          ))}
        </ul>
      )}
      <button type="button" className={styles.add} onClick={() => onCreate(nextFreeSlot(events, day))}>
        <Plus aria-hidden />
        {count === 0 ? "Anotar algo para este día" : "Agregar otro"}
      </button>
    </section>
  );
}
