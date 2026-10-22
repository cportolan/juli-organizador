"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MAIN_NAV, SETTINGS_NAV } from "@/lib/navigation";
import { isActivePath } from "@/components/layout/Sidebar/SidebarNavList";
import styles from "./TabBar.module.css";

const ITEMS = [...MAIN_NAV, SETTINGS_NAV];

/** Navegación del celular: pestañas fijas abajo, al alcance del pulgar. */
export default function TabBar() {
  const pathname = usePathname();

  return (
    <nav className={styles.bar} aria-label="Secciones">
      <ul className={styles.list}>
        {ITEMS.map((item) => {
          const Icon = item.icon;
          const active = isActivePath(pathname, item.href);
          return (
            <li key={item.href}>
              <Link href={item.href} className={styles.tab} aria-current={active ? "page" : undefined}>
                <span className={styles.iconWrap}>
                  <Icon className={styles.icon} aria-hidden />
                </span>
                <span className={styles.label}>{item.shortLabel ?? item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
