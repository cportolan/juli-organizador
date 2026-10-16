"use client";

import { useSyncExternalStore } from "react";

// Fecha de hoy (YYYY-MM-DD) del lado del cliente. En el servidor devuelve
// null: la fecha depende de la zona horaria del navegador.

function todayKey() {
  const now = new Date();
  const pad = (value) => String(value).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

function subscribe(listener) {
  const interval = setInterval(listener, 60_000);
  document.addEventListener("visibilitychange", listener);
  return () => {
    clearInterval(interval);
    document.removeEventListener("visibilitychange", listener);
  };
}

export function useToday() {
  return useSyncExternalStore(subscribe, todayKey, () => null);
}
