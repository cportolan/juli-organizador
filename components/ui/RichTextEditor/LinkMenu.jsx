"use client";

import { useState } from "react";
import { Link2, Unlink } from "lucide-react";
import Button from "@/components/ui/Button/Button";
import IconButton from "@/components/ui/IconButton/IconButton";
import Input from "@/components/ui/Input/Input";
import Popover from "@/components/ui/Popover/Popover";
import styles from "./RichTextEditor.module.css";

function normalizeHref(value) {
  const href = value.trim();
  if (!href) return "";
  if (/^(https?:|mailto:|tel:)/i.test(href)) return href;
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(href)) return `mailto:${href}`;
  return `https://${href}`;
}

/** Agregar, editar o quitar un link sobre el texto seleccionado. */
export default function LinkMenu({ editor, href }) {
  const [value, setValue] = useState("");

  function apply(close) {
    const next = normalizeHref(value);
    const chain = editor.chain().focus().extendMarkRange("link");
    if (!next) chain.unsetLink().run();
    else if (editor.state.selection.empty && href === null) {
      // Sin selección: inserta la dirección como texto con link.
      chain.insertContent({ type: "text", text: value.trim(), marks: [{ type: "link", attrs: { href: next } }] }).run();
    } else chain.setLink({ href: next }).run();
    close();
  }

  return (
    <Popover
      label="Link"
      onOpen={() => setValue(href ?? "")}
      trigger={(props) => (
        <IconButton
          {...props}
          icon={Link2}
          label="Link (Ctrl+K)"
          size="sm"
          tooltipSide="bottom"
          active={href !== null}
          onMouseDown={(event) => event.preventDefault()}
        />
      )}
    >
      {({ close }) => (
        <form
          className={styles.linkForm}
          onSubmit={(event) => {
            event.preventDefault();
            apply(close);
          }}
        >
          <Input
            label="Dirección"
            value={value}
            onChange={(event) => setValue(event.target.value)}
            placeholder="www.ejemplo.com"
            type="text"
            inputMode="url"
            autoComplete="off"
          />
          <div className={styles.linkActions}>
            {href !== null && (
              <Button
                variant="ghost"
                size="sm"
                icon={Unlink}
                onClick={() => {
                  editor.chain().focus().extendMarkRange("link").unsetLink().run();
                  close();
                }}
              >
                Quitar
              </Button>
            )}
            <Button type="submit" variant="primary" size="sm">
              Guardar
            </Button>
          </div>
        </form>
      )}
    </Popover>
  );
}
