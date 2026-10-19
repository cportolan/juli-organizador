"use client";

import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { cx } from "@/lib/utils/cx";
import { normalizeText } from "@/lib/utils/search";
import { positionPopover } from "@/lib/utils/popover";
import Input from "@/components/ui/Input/Input";
import styles from "./Combobox.module.css";

const MAX_OPTIONS = 8;

/**
 * Campo de texto libre que sugiere valores ya usados (patrón combobox de ARIA).
 * Se puede escribir cualquier cosa; las sugerencias solo ahorran tipeo.
 * Acepta las mismas props que Input (name, label, defaultValue...).
 */
export default function Combobox({ options, defaultValue = "", onKeyDown, onBlur, ...props }) {
  const listId = useId();
  const inputRef = useRef(null);
  const listRef = useRef(null);
  const [value, setValue] = useState(defaultValue);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);

  const query = normalizeText(value);
  const matches = options
    .filter((option) => {
      const normalized = normalizeText(option);
      return normalized.includes(query) && normalized !== query;
    })
    .slice(0, MAX_OPTIONS);
  const expanded = open && matches.length > 0;

  useLayoutEffect(() => {
    const list = listRef.current;
    const input = inputRef.current;
    if (!list || !input) return;
    if (!expanded) {
      if (list.matches(":popover-open")) list.hidePopover();
      return;
    }
    if (!list.matches(":popover-open")) list.showPopover();
    list.style.width = `${input.offsetWidth}px`;
    positionPopover(input, list);
  }, [expanded, matches.length]);

  // Si el modal hace scroll o cambia el tamaño de la ventana, se cierra.
  useEffect(() => {
    if (!expanded) return;
    const close = (event) => {
      if (event.target !== listRef.current) setOpen(false);
    };
    window.addEventListener("resize", close);
    document.addEventListener("scroll", close, true);
    return () => {
      window.removeEventListener("resize", close);
      document.removeEventListener("scroll", close, true);
    };
  }, [expanded]);

  function choose(option) {
    setValue(option);
    setOpen(false);
    setActive(-1);
  }

  function handleKeyDown(event) {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      if (!expanded) return setOpen(true);
      // Recorre las opciones y vuelve al texto escrito (-1) en los extremos.
      const step = event.key === "ArrowDown" ? 1 : -1;
      setActive((current) => ((current + step + 1 + matches.length + 1) % (matches.length + 1)) - 1);
    } else if (event.key === "Enter" && expanded && matches[active]) {
      event.preventDefault();
      choose(matches[active]);
    } else if (event.key === "Escape" && expanded) {
      // Que Escape cierre las sugerencias y no el modal.
      event.preventDefault();
      event.stopPropagation();
      setOpen(false);
    }
    onKeyDown?.(event);
  }

  return (
    <>
      <Input
        ref={inputRef}
        role="combobox"
        aria-autocomplete="list"
        aria-expanded={expanded}
        aria-controls={listId}
        aria-activedescendant={expanded && active >= 0 ? `${listId}-${active}` : undefined}
        autoComplete="off"
        value={value}
        onChange={(event) => {
          setValue(event.target.value);
          setOpen(true);
          setActive(-1);
        }}
        onClick={() => setOpen(true)}
        onBlur={(event) => {
          setOpen(false);
          onBlur?.(event);
        }}
        onKeyDown={handleKeyDown}
        {...props}
      />
      <ul ref={listRef} id={listId} popover="manual" role="listbox" className={styles.list}>
        {matches.map((option, index) => (
          <li
            key={option}
            id={`${listId}-${index}`}
            role="option"
            aria-selected={index === active}
            className={cx(styles.option, index === active && styles.active)}
            // mousedown en vez de click: así el input no pierde el foco antes de elegir
            onMouseDown={(event) => {
              event.preventDefault();
              choose(option);
            }}
            onMouseEnter={() => setActive(index)}
          >
            {option}
          </li>
        ))}
      </ul>
    </>
  );
}
