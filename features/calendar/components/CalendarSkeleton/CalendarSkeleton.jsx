import Skeleton from "@/components/ui/Skeleton/Skeleton";
import RightSidebar from "@/components/layout/RightSidebar/RightSidebar";
import styles from "./CalendarSkeleton.module.css";

/** Eventos por día de la agenda de teléfono: 0 es un día libre. */
const PHONE_DAYS = [1, 0, 2, 1, 0, 1, 0];

/**
 * Carga del calendario. Hay dos versiones y el CSS muestra la que corresponde
 * al ancho: la grilla de escritorio o la agenda vertical del teléfono.
 */
export default function CalendarSkeleton() {
  return (
    <div className={styles.skeleton} aria-busy="true" aria-label="Cargando calendario">
      <div className={styles.desktop}>
        <div className={styles.toolbar}>
          <Skeleton width={150} height={34} radius="var(--radius-sm)" />
          <Skeleton width={260} height={34} />
          <Skeleton width={300} height={34} radius="var(--radius-sm)" />
        </div>
        <div className={styles.grid}>
          {Array.from({ length: 7 }, (_, index) => (
            <div key={index} className={styles.column}>
              <Skeleton width={36} height={36} radius="50%" />
            </div>
          ))}
        </div>
      </div>

      <div className={styles.phone}>
        <div className={styles.phoneToolbar}>
          <Skeleton width={170} height={26} />
          <span className={styles.phoneNav}>
            <Skeleton width={56} height={36} radius="var(--radius-sm)" />
            <Skeleton width={36} height={36} radius="50%" />
            <Skeleton width={36} height={36} radius="50%" />
          </span>
        </div>
        <ul className={styles.days}>
          {PHONE_DAYS.map((count, index) => (
            <li key={index} className={styles.day}>
              <span className={styles.date}>
                <Skeleton width={26} height={10} />
                <Skeleton width={30} height={30} radius="50%" />
              </span>
              <span className={styles.events}>
                {count === 0 ? (
                  <span className={styles.free} />
                ) : (
                  Array.from({ length: count }, (_, event) => (
                    <Skeleton key={event} height={60} radius="var(--radius-sm)" />
                  ))
                )}
              </span>
            </li>
          ))}
        </ul>
        <div className={styles.dock} aria-hidden>
          <Skeleton width={232} height={52} radius="var(--radius-full)" />
          <Skeleton width={52} height={52} radius="var(--radius-full)" />
        </div>
      </div>
    </div>
  );
}

export function CalendarAsideSkeleton() {
  return (
    <RightSidebar title="Pendientes" storageKey="oj-calendar-aside">
      <div className={styles.aside} aria-busy="true">
        <Skeleton height={40} radius="var(--radius-md)" />
        <Skeleton height={48} radius="var(--radius-md)" />
        <Skeleton height={40} />
        <Skeleton height={40} />
      </div>
    </RightSidebar>
  );
}
