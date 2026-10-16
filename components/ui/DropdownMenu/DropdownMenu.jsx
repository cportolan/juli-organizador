"use client";

import { useId, useRef } from "react";
import { MoreHorizontal } from "lucide-react";
import { cx } from "@/lib/utils/cx";
import { positionPopover } from "@/lib/utils/popover";
import IconButton from "@/components/ui/IconButton/IconButton";
import Button from "@/components/ui/Button/Button";
import styles from "./DropdownMenu.module.css";

/**
 * Menú desplegable sobre la Popover API (cierra con click afuera y Escape).
 * items: [{ id, label, icon?, onSelect, tone?: "danger" } | { separator: true }]
 * Sin `triggerLabel` el disparador es un IconButton con `icon`.
 */
export default function DropdownMenu({
  items,
  label = "Más opciones",
  icon = MoreHorizontal,
  triggerLabel,
  triggerVariant = "secondary",
  align = "end",
  className,
}) {
  const menuId = useId();
  const triggerRef = useRef(null);
  const menuRef = useRef(null);

  function handleToggle(event) {
    if (event.newState !== "open") return;
    positionPopover(triggerRef.current, menuRef.current, align);
    menuRef.current?.querySelector('[role="menuitem"]')?.focus();
  }

  function handleKeyDown(event) {
    const options = [...menuRef.current.querySelectorAll('[role="menuitem"]')];
    const index = options.indexOf(document.activeElement);
    const moves = { ArrowDown: index + 1, ArrowUp: index - 1, Home: 0, End: options.length - 1 };
    if (!(event.key in moves)) return;
    event.preventDefault();
    options[(moves[event.key] + options.length) % options.length]?.focus();
  }

  function select(item) {
    menuRef.current?.hidePopover();
    triggerRef.current?.focus();
    item.onSelect?.();
  }

  const triggerProps = {
    ref: triggerRef,
    popoverTarget: menuId,
    "aria-haspopup": "menu",
    "aria-controls": menuId,
  };

  return (
    <>
      {triggerLabel ? (
        <Button {...triggerProps} variant={triggerVariant} icon={icon} className={className}>
          {triggerLabel}
        </Button>
      ) : (
        <IconButton {...triggerProps} icon={icon} label={label} className={className} />
      )}
      <div
        ref={menuRef}
        id={menuId}
        popover="auto"
        role="menu"
        aria-label={label}
        className={styles.menu}
        onToggle={handleToggle}
        onKeyDown={handleKeyDown}
      >
        {items.map((item, index) =>
          item.separator ? (
            <hr key={`separator-${index}`} className={styles.separator} />
          ) : (
            <button
              key={item.id}
              type="button"
              role="menuitem"
              className={cx(styles.item, item.tone === "danger" && styles.danger)}
              onClick={() => select(item)}
            >
              {item.icon && <item.icon className={styles.icon} aria-hidden />}
              {item.label}
            </button>
          ),
        )}
      </div>
    </>
  );
}
