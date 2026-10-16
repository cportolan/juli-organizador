import Skeleton from "@/components/ui/Skeleton/Skeleton";
import styles from "./PeopleSkeleton.module.css";

export default function PeopleSkeleton() {
  return (
    <div aria-busy="true" aria-label="Cargando fichas">
      <div className={styles.tabs}>
        {[140, 120, 160].map((width) => (
          <Skeleton key={width} width={width} height={40} radius="var(--radius-md) var(--radius-md) 0 0" />
        ))}
      </div>
      <div className={styles.sheet}>
        <Skeleton width={240} height={30} />
        <Skeleton height={14} />
        <Skeleton width="80%" height={14} />
        <Skeleton width="55%" height={14} />
      </div>
    </div>
  );
}
