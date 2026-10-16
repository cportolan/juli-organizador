"use client";

import { useCallback, useEffect, useState } from "react";
import { getPerson, savePersonContent } from "./peopleService";

/**
 * Contenido de una ficha. Si tiene contraseña, queda "locked" hasta que se
 * desbloquea con `unlock(password)`. La contraseña no se guarda en ningún lado.
 * status: "loading" | "locked" | "ready" | "error"
 */
export function usePersonContent(person) {
  const [state, setState] = useState({ status: person.hasPassword ? "locked" : "loading", content: null, error: null });

  const load = useCallback(
    async (password) => {
      try {
        const result = await getPerson({ id: person.id, password });
        if (result.ok) setState({ status: "ready", content: result.data.content, error: null });
        else setState({ status: person.hasPassword ? "locked" : "error", content: null, error: result.error });
        return result;
      } catch {
        setState({ status: "error", content: null, error: "No se pudo cargar la ficha." });
        return { ok: false };
      }
    },
    [person.id, person.hasPassword],
  );

  useEffect(() => {
    if (person.hasPassword) return;
    let active = true;
    getPerson({ id: person.id })
      .then((result) => {
        if (!active) return;
        setState(
          result.ok
            ? { status: "ready", content: result.data.content, error: null }
            : { status: "error", content: null, error: result.error },
        );
      })
      .catch(() => active && setState({ status: "error", content: null, error: "No se pudo cargar la ficha." }));
    return () => {
      active = false;
    };
  }, [person.id, person.hasPassword]);

  const save = useCallback(
    (content) => savePersonContent({ id: person.id, content }).catch(() => ({ ok: false })),
    [person.id],
  );

  return { ...state, unlock: load, retry: () => load(), save };
}
