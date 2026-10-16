import Skeleton from "@/components/ui/Skeleton/Skeleton";
import styles from "./TodoBoardSkeleton.module.css";

const CARDS = [[3, 2], [2]];

export default function TodoBoardSkeleton() {
  return (
    <div className={styles.skeleton} aria-busy="true" aria-label="Cargando pendientes">
      <div className={styles.toolbar}>
        <Skeleton width={420} height={40} radius="var(--radius-sm)" />
        <Skeleton width={260} height={40} radius="var(--radius-sm)" />
      </div>
      <Skeleton height={48} radius="var(--radius-md)" />
      <div className={styles.columns}>
        {CARDS.map((cards, column) => (
          <div key={column} className={styles.column}>
            <Skeleton width={120} height={20} />
            {Array.from({ length: cards.length + 1 }, (_, index) => (
              <Skeleton key={index} height={72} radius="var(--radius-md)" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
