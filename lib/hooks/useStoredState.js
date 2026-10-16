"use client";

import { useCallback, useSyncExternalStore } from "react";

// Estado chico persistido en localStorage (preferencias de UI por navegador:
// sidebar colapsado, vista elegida, etc.). No usar para datos del usuario.

const listeners = new Set();

function subscribe(listener) {
  listeners.add(listener);
  window.addEventListener("storage", listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", listener);
  };
}

function readRaw(key) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function useStoredState(key, defaultValue) {
  const raw = useSyncExternalStore(
    subscribe,
    () => readRaw(key),
    () => null,
  );

  let value = defaultValue;
  if (raw !== null) {
    try {
      value = JSON.parse(raw);
    } catch {
      value = defaultValue;
    }
  }

  const setValue = useCallback(
    (next) => {
      const resolved = typeof next === "function" ? next(JSON.parse(readRaw(key) ?? JSON.stringify(defaultValue))) : next;
      try {
        localStorage.setItem(key, JSON.stringify(resolved));
      } catch {
        // Sin storage: la preferencia no se recuerda, pero no rompe nada.
      }
      listeners.forEach((listener) => listener());
    },
    [key, defaultValue],
  );

  return [value, setValue];
}
