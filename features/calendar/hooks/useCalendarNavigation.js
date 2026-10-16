"use client";

import { useCallback, useTransition } from "react";
import { useRouter } from "next/navigation";
import { calendarHref } from "@/lib/utils/calendar";

/**
 * La vista, la cantidad de días y la fecha viven en la URL: el servidor carga
 * los eventos del rango. Navegar dentro de una transición mantiene la vista
 * anterior en pantalla (atenuada) mientras llega la nueva.
 */
export function useCalendarNavigation(state) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const go = useCallback(
    (changes) => {
      const href = calendarHref({ ...state, ...changes });
      startTransition(() => router.push(href, { scroll: false }));
    },
    [router, state],
  );

  const refresh = useCallback(() => startTransition(() => router.refresh()), [router]);

  return { go, refresh, pending };
}
