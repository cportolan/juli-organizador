"use client";

/**
 * Navegación con flechas, Home y End entre opciones de un grupo
 * (tabs, segmented controls). Devuelve el handler de onKeyDown.
 */
export function useRovingFocus({ items, value, onChange, orientation = "horizontal" }) {
  const prevKey = orientation === "horizontal" ? "ArrowLeft" : "ArrowUp";
  const nextKey = orientation === "horizontal" ? "ArrowRight" : "ArrowDown";

  return function onKeyDown(event) {
    const index = items.findIndex((item) => item.id === value);
    let next = null;

    if (event.key === prevKey) next = (index - 1 + items.length) % items.length;
    if (event.key === nextKey) next = (index + 1) % items.length;
    if (event.key === "Home") next = 0;
    if (event.key === "End") next = items.length - 1;
    if (next === null) return;

    event.preventDefault();
    onChange(items[next].id);
    const group = event.currentTarget;
    requestAnimationFrame(() => group.querySelector('[data-active="true"]')?.focus());
  };
}
