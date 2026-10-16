"use client";

import { useCallback, useState } from "react";
import { useToast } from "@/components/ui/Toast/Toast";

const NETWORK_ERROR = "No se pudo conectar. Revisá la conexión y probá de nuevo.";

/**
 * Envuelve una Server Action que devuelve { ok, data | error }.
 * Muestra el error en un toast y devuelve el resultado para que la UI
 * actualice su estado solo si salió bien.
 *
 *   const [save, saving] = useMutation(updatePhone);
 *   const result = await save({ id, data });
 *   if (result.ok) ...
 */
export function useMutation(action, { successMessage } = {}) {
  const toast = useToast();
  const [pending, setPending] = useState(false);

  const run = useCallback(
    async (...args) => {
      setPending(true);
      try {
        const result = await action(...args);
        if (!result?.ok) {
          toast.error(result?.error ?? "Algo salió mal.");
          return { ok: false, error: result?.error };
        }
        if (successMessage) toast.success(successMessage);
        return result;
      } catch {
        toast.error(NETWORK_ERROR);
        return { ok: false, error: NETWORK_ERROR };
      } finally {
        setPending(false);
      }
    },
    [action, toast, successMessage],
  );

  return [run, pending];
}
