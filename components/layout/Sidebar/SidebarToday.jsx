"use client";

import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { useToday } from "@/lib/hooks/useToday";
import Skeleton from "@/components/ui/Skeleton/Skeleton";
import styles from "./Sidebar.module.css";

/** La fecha de hoy, en grande: el ancla de todo el organizador. */
export default function SidebarToday({ collapsed }) {
  const today = useToday();

  if (!today) {
    return (
      <div className={styles.today} aria-hidden>
        <Skeleton width={collapsed ? 32 : 70} height={12} />
        <Skeleton width={collapsed ? 32 : 130} height={22} />
      </div>
    );
  }

  const date = parseISO(today);

  return (
    <time dateTime={today} className={styles.today}>
      <span className={styles.todayWeekday}>{format(date, collapsed ? "EEEEEE" : "EEEE", { locale: es })}</span>
      <span className={styles.todayDate}>
        <span className={styles.todayDay}>{format(date, "d")}</span>
        <span className={styles.todayMonth}>{format(date, collapsed ? "MMM" : "'de' MMMM", { locale: es })}</span>
      </span>
    </time>
  );
}
