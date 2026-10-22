"use client";

import { useEffect } from "react";

// Campos que no abren el teclado (tienen su propio selector del sistema).
const NO_KEYBOARD = new Set(["checkbox", "radio", "button", "submit", "reset", "range", "color", "file", "date", "time", "datetime-local", "month", "week"]);

function opensKeyboard(element) {
  if (element instanceof HTMLTextAreaElement) return !element.readOnly;
  if (element instanceof HTMLInputElement) return !element.readOnly && !NO_KEYBOARD.has(element.type);
  return element instanceof HTMLElement && element.isContentEditable;
}

/**
 * En pantallas táctiles marca <html data-keyboard> mientras hay un campo de texto
 * enfocado: el teclado achica la pantalla y lo que flota abajo (pestañas, menú del
 * calendario, botones) se esconde para que se vea lo que se escribe.
 */
export function useKeyboardFlag() {
  useEffect(() => {
    if (!window.matchMedia("(pointer: coarse)").matches) return undefined;
    const root = document.documentElement;
    const sync = () => {
      if (opensKeyboard(document.activeElement)) root.dataset.keyboard = "";
      else delete root.dataset.keyboard;
    };
    // Al pasar de un campo a otro hay un instante sin foco: se espera al siguiente.
    const handleFocusOut = () => setTimeout(sync, 60);
    document.addEventListener("focusin", sync);
    document.addEventListener("focusout", handleFocusOut);
    return () => {
      document.removeEventListener("focusin", sync);
      document.removeEventListener("focusout", handleFocusOut);
      delete root.dataset.keyboard;
    };
  }, []);
}
