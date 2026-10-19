import { cx } from "@/lib/utils/cx";
import { formatDate } from "@/lib/utils/dates";
import { keyToDate } from "@/lib/utils/calendar";
import styles from "./DayHeading.module.css";

/**
 * Encabezado de un día (semana / día): "lun 19". Al tocarlo se abre ese día.
 * Con `showHolidayName` muestra el nombre del feriado debajo del número.
 */
export default function DayHeading({ day, today, selectedDate, holiday, showHolidayName = false, onClick, className }) {
  const date = keyToDate(day);
  return (
    <button
      type="button"
      className={cx(
        styles.heading,
        holiday && styles.holiday,
        day === today && styles.today,
        day === selectedDate && styles.selected,
        className,
      )}
      onClick={() => onClick(day)}
      aria-label={`${formatDate(date, "EEEE d 'de' MMMM")}${holiday ? `, feriado: ${holiday.name}` : ""}`}
    >
      <span className={styles.weekday}>{formatDate(date, "EEE").replace(".", "")}</span>
      <span className={styles.dayNumber}>{formatDate(date, "d")}</span>
      {showHolidayName && holiday && (
        <span className={styles.holidayName} title={holiday.name}>
          {holiday.name}
        </span>
      )}
    </button>
  );
}
