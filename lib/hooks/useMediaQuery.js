"use client";

import { useCallback, useSyncExternalStore } from "react";

/** true si la media query coincide. En el servidor devuelve `serverValue`. */
export function useMediaQuery(query, serverValue = false) {
  const subscribe = useCallback(
    (listener) => {
      const media = window.matchMedia(query);
      media.addEventListener("change", listener);
      return () => media.removeEventListener("change", listener);
    },
    [query],
  );

  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => serverValue,
  );
}

export const MOBILE_QUERY = "(max-width: 860px)";

/** Teléfonos: layouts de una columna (agenda vertical, hojas desde abajo). */
export const PHONE_QUERY = "(max-width: 640px)";
