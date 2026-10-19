"use client";

import { useId, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import { cx } from "@/lib/utils/cx";
import { normalizeText } from "@/lib/utils/search";
import { positionPopover } from "@/lib/utils/popover";
import fieldStyles from "@/components/ui/Field/Field.module.css";
import styles from "./Select.module.css";

const TYPEAHEAD_MS = 600;

/**
 * Parte de escritorio de Select: botón + lista en un popover.
 * Teclado como un select: flechas, Home/End, Enter, Escape y tipear para buscar.
 */
export default function SelectMenu({ ref, id, name, items, value, disabled, onChange, describedBy, invalid, ...props }) {
  const listId = useId();
  const triggerRef = useRef(null);
  const listRef = useRef(null);
  const typed = useRef({ text: "", at: 0 });
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);

  const selectedIndex = Math.max(
    0,
    items.findIndex((item) => item.value === value),
  );
  const selected = items.find((item) => item.value === value) ?? items[0];

  function setTriggerRef(node) {
    triggerRef.current = node;
    if (typeof ref === "function") ref(node);
    else if (ref) ref.current = node;
  }

  function show() {
    if (disabled || !items.length) return;
    listRef.current?.showPopover();
  }

  function hide({ focus = true } = {}) {
    if (listRef.current?.matches(":popover-open")) listRef.current.hidePopover();
    if (focus) triggerRef.current?.focus();
  }

  function choose(index) {
    const item = items[index];
    if (item && item.value !== value) onChange(item.value);
    hide();
  }

  function handleToggle(event) {
    const isOpen = event.newState === "open";
    setOpen(isOpen);
    if (!isOpen) return;
    setActive(selectedIndex);
    const list = listRef.current;
    list.style.minWidth = `${triggerRef.current.offsetWidth}px`;
    positionPopover(triggerRef.current, list);
    list.focus();
    list.querySelector('[aria-selected="true"]')?.scrollIntoView({ block: "nearest" });
  }

  /** Tipear letras salta a la opción que empieza así (como en el nativo). */
  function typeahead({ key, timeStamp: now }) {
    const text = now - typed.current.at < TYPEAHEAD_MS ? typed.current.text + key : key;
    typed.current = { text, at: now };
    const query = normalizeText(text);
    return items.findIndex((item) => normalizeText(item.label).startsWith(query));
  }

  function handleTriggerKeyDown(event) {
    if (["ArrowDown", "ArrowUp", "Enter", " "].includes(event.key)) {
      event.preventDefault();
      show();
    } else if (event.key.length === 1 && !event.metaKey && !event.ctrlKey) {
      // Con el menú cerrado, tipear cambia el valor directo (como el nativo).
      const index = typeahead(event);
      if (index >= 0 && items[index].value !== value) onChange(items[index].value);
    }
  }

  function moveTo(index) {
    setActive(index);
    listRef.current?.querySelector(`#${CSS.escape(`${listId}-${index}`)}`)?.scrollIntoView({ block: "nearest" });
  }

  function handleListKeyDown(event) {
    const last = items.length - 1;
    if (event.key === "ArrowDown") moveTo(Math.min(active + 1, last));
    else if (event.key === "ArrowUp") moveTo(Math.max(active - 1, 0));
    else if (event.key === "Home") moveTo(0);
    else if (event.key === "End") moveTo(last);
    else if (event.key === "Enter" || event.key === " ") choose(active);
    else if (event.key === "Escape") {
      // Que Escape cierre solo el menú y no el modal de atrás.
      event.stopPropagation();
      hide();
    } else if (event.key === "Tab") {
      hide({ focus: false });
      return;
    } else if (event.key.length === 1) {
      const index = typeahead(event);
      if (index >= 0) moveTo(index);
      return;
    } else return;
    event.preventDefault();
  }

  return (
    <>
      {name && <input type="hidden" name={name} value={value} />}
      <button
        ref={setTriggerRef}
        id={id}
        type="button"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-describedby={describedBy}
        aria-invalid={invalid || undefined}
        disabled={disabled}
        className={cx(fieldStyles.control, styles.control, styles.trigger)}
        // popoverTarget: el navegador abre y cierra con click (y no lo toma como "click afuera")
        popoverTarget={listId}
        onKeyDown={handleTriggerKeyDown}
        {...props}
      >
        {selected?.color && <span className={styles.dot} style={{ "--tone": selected.color }} aria-hidden />}
        <span className={cx(styles.value, selected?.placeholder && styles.placeholder)}>{selected?.label}</span>
        <ChevronDown className={cx(styles.chevron, open && styles.chevronOpen)} aria-hidden />
      </button>
      <ul
        ref={listRef}
        id={listId}
        popover="auto"
        role="listbox"
        tabIndex={-1}
        aria-labelledby={id}
        aria-activedescendant={open ? `${listId}-${active}` : undefined}
        className={styles.menu}
        onToggle={handleToggle}
        onKeyDown={handleListKeyDown}
      >
        {items.map((item, index) => (
          <li
            key={item.value}
            id={`${listId}-${index}`}
            role="option"
            aria-selected={item.value === value}
            className={cx(styles.option, index === active && styles.active, item.placeholder && styles.placeholder)}
            onPointerMove={() => active !== index && setActive(index)}
            onClick={() => choose(index)}
          >
            {item.color && <span className={styles.dot} style={{ "--tone": item.color }} aria-hidden />}
            <span className={styles.optionLabel}>{item.label}</span>
            {item.value === value && <Check className={styles.check} aria-hidden />}
          </li>
        ))}
      </ul>
    </>
  );
}
