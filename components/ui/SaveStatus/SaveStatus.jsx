import { Check, CloudAlert, LoaderCircle } from "lucide-react";
import { cx } from "@/lib/utils/cx";
import styles from "./SaveStatus.module.css";

const STATES = {
  pending: { label: "Cambios sin guardar", icon: null },
  saving: { label: "Guardando…", icon: LoaderCircle },
  saved: { label: "Guardado", icon: Check },
  error: { label: "No se pudo guardar", icon: CloudAlert },
};

/** Indicador discreto del autoguardado (ver useAutosave). */
export default function SaveStatus({ status, className }) {
  const state = STATES[status];
  return (
    <p className={cx(styles.status, className)} data-status={status} role="status" aria-live="polite">
      {state && (
        <>
          {state.icon ? <state.icon className={styles.icon} aria-hidden /> : <span className={styles.dot} aria-hidden />}
          {state.label}
        </>
      )}
    </p>
  );
}
