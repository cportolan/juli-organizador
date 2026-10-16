"use client";

import { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";
import { CircleAlert, CircleCheck, Info, X } from "lucide-react";
import { cx } from "@/lib/utils/cx";
import styles from "./Toast.module.css";

const ToastContext = createContext(null);

const ICONS = { success: CircleCheck, error: CircleAlert, info: Info };
const DURATION = 4000;
const EXIT_MS = 200;

/**
 * Uso: const toast = useToast();
 * toast.success("Guardado"); toast.error("No se pudo guardar");
 * toast.show({ message, tone, action: { label, onClick } })
 */
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const nextId = useRef(0);

  const dismiss = useCallback((id) => {
    setToasts((current) => current.map((toast) => (toast.id === id ? { ...toast, leaving: true } : toast)));
    setTimeout(() => setToasts((current) => current.filter((toast) => toast.id !== id)), EXIT_MS);
  }, []);

  const show = useCallback(
    ({ message, tone = "info", action, duration = DURATION }) => {
      const id = ++nextId.current;
      setToasts((current) => [...current.slice(-2), { id, message, tone, action }]);
      if (duration) setTimeout(() => dismiss(id), duration);
      return id;
    },
    [dismiss],
  );

  const api = useMemo(
    () => ({
      show,
      dismiss,
      success: (message, options) => show({ ...options, message, tone: "success" }),
      error: (message, options) => show({ ...options, message, tone: "error" }),
      info: (message, options) => show({ ...options, message, tone: "info" }),
    }),
    [show, dismiss],
  );

  return (
    <ToastContext.Provider value={api}>
      {children}
      <ol className={styles.region} aria-live="polite" aria-label="Notificaciones">
        {toasts.map(({ id, message, tone, action, leaving }) => {
          const Icon = ICONS[tone];
          return (
            <li key={id} className={cx(styles.toast, styles[tone], leaving && styles.leaving)}>
              <Icon className={styles.icon} aria-hidden />
              <p className={styles.message}>{message}</p>
              {action && (
                <button
                  type="button"
                  className={styles.action}
                  onClick={() => {
                    action.onClick();
                    dismiss(id);
                  }}
                >
                  {action.label}
                </button>
              )}
              <button type="button" className={styles.close} onClick={() => dismiss(id)} aria-label="Cerrar">
                <X aria-hidden />
              </button>
            </li>
          );
        })}
      </ol>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast tiene que usarse dentro de <ToastProvider>");
  return context;
}
