"use client";

import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { useToday } from "@/lib/hooks/useToday";
import Skeleton from "@/components/ui/Skeleton/Skeleton";
import styles from "./Sidebar.module.css";
import { capitalize } from "@/lib/utils/format";

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

  if (collapsed) {
    return (
      <time dateTime={today} className={styles.today}>
        <span className={styles.todayWeekday}>{format(date, "EEEEEE", { locale: es })}</span>
        <span className={styles.todayDay}>{format(date, "d")}</span>
      </time>
    );
  }

  // "Lunes / de Octubre" a la izquierda y el número del alto de las dos líneas.
  return (
    <time dateTime={today} className={styles.today}>
      <span className={styles.todayWeekday}>{capitalize(format(date, "EEEE", { locale: es }))}</span>
      <span className={styles.todayMonth}>de {capitalize(format(date, "MMMM", { locale: es }))}</span>
      <span className={styles.todayDay}>{format(date, "d")}</span>
    </time>
  );
}
