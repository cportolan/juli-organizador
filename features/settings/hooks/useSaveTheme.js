"use client";

import { useCallback, useEffect, useRef } from "react";
import { updateTheme } from "@/lib/theme/themeStore";
import { useToast } from "@/components/ui/Toast/Toast";
import { updateSettings } from "@/features/settings/actions";

const SAVE_DELAY = 600;

/**
 * Aplica el tema al instante y lo guarda en Supabase agrupando cambios
 * seguidos (por ejemplo, al arrastrar el selector de color).
 */
export function useSaveTheme() {
  const toast = useToast();
  const pending = useRef({});
  const timer = useRef(null);

  const flush = useCallback(async () => {
    const changes = pending.current;
    pending.current = {};
    if (!Object.keys(changes).length) return;

    const result = await updateSettings(changes);
    if (!result.ok) toast.error(result.error);
  }, [toast]);

  useEffect(() => () => {
    clearTimeout(timer.current);
    flush();
  }, [flush]);

  return useCallback(
    (partial) => {
      updateTheme(partial);
      pending.current = { ...pending.current, ...partial };
      clearTimeout(timer.current);
      timer.current = setTimeout(flush, SAVE_DELAY);
    },
    [flush],
  );
}
