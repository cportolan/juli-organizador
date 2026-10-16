"use client";

import { useSyncExternalStore } from "react";

// Minuto actual (timestamp redondeado) para la línea de "ahora". null en el servidor.

let cached = null;

function snapshot() {
  const minute = Math.floor(Date.now() / 60_000) * 60_000;
  if (cached !== minute) cached = minute;
  return cached;
}

function subscribe(listener) {
  const interval = setInterval(listener, 30_000);
  document.addEventListener("visibilitychange", listener);
  return () => {
    clearInterval(interval);
    document.removeEventListener("visibilitychange", listener);
  };
}

export function useNow() {
  return useSyncExternalStore(subscribe, snapshot, () => null);
}
