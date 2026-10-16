"use client";

import { useLayoutEffect } from "react";

/**
 * Posiciona un indicador animado bajo el elemento activo de una lista.
 * Escribe --indicator-x / -y / -w / -h en el contenedor (sin re-renders).
 * El elemento activo se marca con [data-active="true"].
 */
export function useSlidingIndicator(containerRef, activeKey) {
  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const update = () => {
      const active = container.querySelector('[data-active="true"]');
      container.style.setProperty("--indicator-x", `${active?.offsetLeft ?? 0}px`);
      container.style.setProperty("--indicator-w", `${active?.offsetWidth ?? 0}px`);
      container.style.setProperty("--indicator-y", `${active?.offsetTop ?? 0}px`);
      container.style.setProperty("--indicator-h", `${active?.offsetHeight ?? 0}px`);
      container.style.setProperty("--indicator-opacity", active ? "1" : "0");
    };

    update();
    // La primera vez se ubica sin animar; después se desliza.
    const frame = requestAnimationFrame(() => (container.dataset.indicatorReady = "true"));
    const observer = new ResizeObserver(update);
    observer.observe(container);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [containerRef, activeKey]);
}
