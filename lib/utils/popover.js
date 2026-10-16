const GAP = 6;
const MARGIN = 8;

/**
 * Ubica un elemento con [popover] (position: fixed) debajo de su disparador,
 * o arriba si no entra. align: "start" | "end".
 */
export function positionPopover(trigger, popover, align = "start") {
  if (!trigger || !popover) return;
  const rect = trigger.getBoundingClientRect();
  const width = popover.offsetWidth;
  const height = popover.offsetHeight;

  let left = align === "end" ? rect.right - width : rect.left;
  left = Math.min(Math.max(MARGIN, left), window.innerWidth - width - MARGIN);
  const below = rect.bottom + GAP;
  const top = below + height > window.innerHeight - MARGIN ? Math.max(MARGIN, rect.top - height - GAP) : below;

  popover.style.left = `${left}px`;
  popover.style.top = `${top}px`;
}
