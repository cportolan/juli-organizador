import Link from "next/link";
import Tooltip from "@/components/ui/Tooltip/Tooltip";
import styles from "./Sidebar.module.css";

export default function SidebarNavItem({ item, active, collapsed }) {
  const Icon = item.icon;

  const link = (
    <Link
      href={item.href}
      className={styles.link}
      aria-current={active ? "page" : undefined}
      aria-label={collapsed ? item.label : undefined}
    >
      <Icon className={styles.linkIcon} aria-hidden />
      <span className={styles.linkLabel}>{item.label}</span>
    </Link>
  );

  return <li data-active={active}>{collapsed ? <Tooltip content={item.label} side="right">{link}</Tooltip> : link}</li>;
}
