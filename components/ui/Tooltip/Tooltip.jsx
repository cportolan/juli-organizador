import { cx } from "@/lib/utils/cx";
import styles from "./Tooltip.module.css";

/**
 * Tooltip liviano en CSS: aparece con hover o foco del hijo.
 * side: "top" | "bottom" | "right" | "left"
 */
export default function Tooltip({ content, side = "top", children, className }) {
  if (!content) return children;

  return (
    <span className={cx(styles.wrapper, className)}>
      {children}
      <span role="tooltip" className={cx(styles.tooltip, styles[side])}>
        {content}
      </span>
    </span>
  );
}
