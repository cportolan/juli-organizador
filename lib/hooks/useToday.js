"use client";

import { useSyncExternalStore } from "react";
import { toDateKey } from "@/lib/utils/dates";

// Fecha de hoy (YYYY-MM-DD, zona de la app) del lado del cliente. En el
// servidor devuelve null para no fijar en el HTML un "hoy" que puede vencer.

function todayKey() {
  return toDateKey(new Date());
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
