"use client";

import { useEffect } from "react";

// Ventaja que se le da al aviso para llegar a la app antes que el selector.
const HEAD_START_MS = 250;

/**
 * Solo dentro de la app nativa (WebView con window.ReactNativeWebView): el
 * selector de archivos del sistema manda la app al fondo y la app se bloquea
 * con la huella. Si antes recibe {type: "leaving"} no se bloquea, pero el aviso
 * tiene que llegarle antes que el selector; si llega después, se ve un parpadeo
 * de la pantalla de la huella. Por eso se frena el click, se avisa y el
 * selector se abre un instante después (sigue dentro de la activación del toque).
 */
export function useNativeFilePicker() {
  useEffect(() => {
    const bridge = window.ReactNativeWebView;
    if (!bridge) return undefined;
    const released = new WeakSet();

    function handleClick(event) {
      const input = event.target;
      if (!(input instanceof HTMLInputElement) || input.type !== "file" || input.disabled) return;
      if (released.has(input)) {
        released.delete(input);
        return;
      }
      event.preventDefault();
      bridge.postMessage(JSON.stringify({ type: "leaving" }));
      setTimeout(() => {
        released.add(input);
        input.click();
      }, HEAD_START_MS);
    }

    document.addEventListener("click", handleClick, true);
    return () => document.removeEventListener("click", handleClick, true);
  }, []);
}
