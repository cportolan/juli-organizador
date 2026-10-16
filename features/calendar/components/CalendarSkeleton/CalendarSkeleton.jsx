import Skeleton from "@/components/ui/Skeleton/Skeleton";
import RightSidebar from "@/components/layout/RightSidebar/RightSidebar";
import styles from "./CalendarSkeleton.module.css";

export default function CalendarSkeleton() {
  return (
    <div className={styles.skeleton} aria-busy="true" aria-label="Cargando calendario">
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
  );
}

export function CalendarAsideSkeleton() {
  return (
    <RightSidebar title="Tu día" storageKey="oj-calendar-aside">
      <div className={styles.aside} aria-busy="true">
        <Skeleton width={120} height={18} />
        <Skeleton height={120} radius="var(--radius-md)" />
        <Skeleton width={100} height={18} />
        <Skeleton height={48} radius="var(--radius-md)" />
        <Skeleton height={40} />
        <Skeleton height={40} />
      </div>
    </RightSidebar>
  );
}
