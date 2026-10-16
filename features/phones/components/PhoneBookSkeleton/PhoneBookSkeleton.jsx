import Skeleton from "@/components/ui/Skeleton/Skeleton";
import styles from "./PhoneBookSkeleton.module.css";

const ROWS = [62, 48, 70, 54, 66, 44];

export default function PhoneBookSkeleton() {
  return (
    <div className={styles.skeleton} aria-busy="true" aria-label="Cargando internos">
      <div className={styles.toolbar}>
        <Skeleton width={420} height={40} radius="var(--radius-sm)" />
        <Skeleton width={140} height={40} radius="var(--radius-sm)" />
      </div>
      <div className={styles.rows}>
        {ROWS.map((width, index) => (
          <div key={index} className={styles.row}>
            <Skeleton width={`${width}%`} height={14} />
            <Skeleton width={`${width + 10}%`} height={14} />
            <Skeleton width={56} height={14} />
          </div>
        ))}
      </div>
    </div>
  );
}
