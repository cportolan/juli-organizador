"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const DEFAULT_DELAY = 800;

/**
 * Guarda con un retraso después del último cambio (autoguardado).
 * `save(value)` es async y devuelve { ok }. Si se desmonta o cambia la
 * clave (`key`) con cambios sin guardar, los guarda en el momento.
 *
 *   const { schedule, status } = useAutosave((content) => saveDayNote({ date, content }), { key: date });
 *   <Editor onChange={schedule} />
 *
 * status: "idle" | "pending" | "saving" | "saved" | "error"
 */
export function useAutosave(save, { delay = DEFAULT_DELAY, key } = {}) {
  const [status, setStatus] = useState("idle");
  const timer = useRef(null);
  const pending = useRef(undefined);
  const saveRef = useRef(save);

  useEffect(() => {
    saveRef.current = save;
  }, [save]);

  const flush = useCallback(async () => {
    clearTimeout(timer.current);
    if (pending.current === undefined) return;
    const value = pending.current;
    pending.current = undefined;
    setStatus("saving");
    const result = await saveRef.current(value);
    // Si mientras guardaba hubo otro cambio, queda pendiente.
    if (pending.current !== undefined) return;
    setStatus(result?.ok ? "saved" : "error");
  }, []);

  const schedule = useCallback(
    (value) => {
      pending.current = value;
      setStatus("pending");
      clearTimeout(timer.current);
      timer.current = setTimeout(flush, delay);
    },
    [delay, flush],
  );

  // Al cambiar de documento (o desmontar) se guarda lo que haya quedado.
  useEffect(() => () => void flush(), [key, flush]);

  // Evita cerrar la pestaña con cambios sin guardar.
  useEffect(() => {
    function handleBeforeUnload(event) {
      if (pending.current !== undefined) event.preventDefault();
    }
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  return { schedule, flush, status };
}
