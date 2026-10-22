"use client";

import { useRef } from "react";
import { usePathname } from "next/navigation";
import { useSlidingIndicator } from "@/lib/hooks/useSlidingIndicator";
import SidebarNavItem from "./SidebarNavItem";
import styles from "./Sidebar.module.css";

export function isActivePath(pathname, href) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

/** Lista de links con un indicador que se desliza por debajo hasta el activo. */
export default function SidebarNavList({ items, collapsed }) {
  const ref = useRef(null);
  const pathname = usePathname();
  useSlidingIndicator(ref, `${pathname}-${collapsed}`);

  return (
    <ul ref={ref} className={styles.list}>
      <li className={styles.indicator} aria-hidden />
      {items.map((item) => (
        <SidebarNavItem
          key={item.href}
          item={item}
          active={isActivePath(pathname, item.href)}
          collapsed={collapsed}
        />
      ))}
    </ul>
  );
}
