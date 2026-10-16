import Link from "next/link";
import { LoaderCircle } from "lucide-react";
import { cx } from "@/lib/utils/cx";
import styles from "./Button.module.css";

/**
 * Botón base. Con `href` se renderiza como Link.
 * variant: "primary" | "secondary" | "ghost" | "danger"
 * size: "sm" | "md" | "lg"
 */
export default function Button({
  variant = "secondary",
  size = "md",
  icon: Icon,
  iconRight: IconRight,
  loading = false,
  fullWidth = false,
  href,
  className,
  children,
  disabled,
  type = "button",
  ...props
}) {
  const classes = cx(
    styles.button,
    styles[variant],
    styles[size],
    fullWidth && styles.fullWidth,
    loading && styles.loading,
    className,
  );

  const content = (
    <>
      {loading ? (
        <LoaderCircle className={styles.spinner} aria-hidden />
      ) : (
        Icon && <Icon className={styles.icon} aria-hidden />
      )}
      {children && <span>{children}</span>}
      {IconRight && <IconRight className={styles.icon} aria-hidden />}
    </>
  );

  if (href) {
    return (
      <Link href={href} className={classes} {...props}>
        {content}
      </Link>
    );
  }

  return (
    <button
      type={type}
      className={classes}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {content}
    </button>
  );
}
