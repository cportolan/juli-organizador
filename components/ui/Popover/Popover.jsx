"use client";

import { useId, useRef } from "react";
import { cx } from "@/lib/utils/cx";
import { positionPopover } from "@/lib/utils/popover";
import styles from "./Popover.module.css";

/**
 * Panel flotante sobre la Popover API (cierra con click afuera y Escape).
 * `trigger` es una función que recibe las props a poner en el botón que lo abre.
 * `children` puede ser una función que recibe { close }.
 */
export default function Popover({ trigger, label, align = "start", onOpen, className, children }) {
  const id = useId();
  const triggerRef = useRef(null);
  const panelRef = useRef(null);

  function close() {
    panelRef.current?.hidePopover();
  }

  function handleToggle(event) {
    if (event.newState !== "open") return;
    positionPopover(triggerRef.current, panelRef.current, align);
    onOpen?.();
    panelRef.current?.querySelector("input, button, [tabindex]")?.focus();
  }

  return (
    <>
      {trigger({ ref: triggerRef, popoverTarget: id, "aria-haspopup": "dialog", "aria-controls": id })}
      <div
        ref={panelRef}
        id={id}
        popover="auto"
        role="dialog"
        aria-label={label}
        className={cx(styles.panel, className)}
        onToggle={handleToggle}
      >
        {typeof children === "function" ? children({ close }) : children}
      </div>
    </>
  );
}
