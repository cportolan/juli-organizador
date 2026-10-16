import { cx } from "@/lib/utils/cx";
import Tooltip from "@/components/ui/Tooltip/Tooltip";
import styles from "./IconButton.module.css";

/**
 * Botón solo con ícono. `label` es obligatorio: se usa como aria-label y tooltip.
 * variant: "ghost" | "soft" | "outline"
 */
export default function IconButton({
  icon: Icon,
  label,
  variant = "ghost",
  size = "md",
  active = false,
  tooltip = true,
  tooltipSide,
  className,
  type = "button",
  ...props
}) {
  const button = (
    <button
      type={type}
      aria-label={label}
      className={cx(styles.button, styles[variant], styles[size], active && styles.active, className)}
      {...props}
    >
      <Icon className={styles.icon} aria-hidden />
    </button>
  );

  if (!tooltip) return button;
  return (
    <Tooltip content={label} side={tooltipSide}>
      {button}
    </Tooltip>
  );
}
