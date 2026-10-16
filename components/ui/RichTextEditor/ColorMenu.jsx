"use client";

import { Ban, Palette } from "lucide-react";
import { cx } from "@/lib/utils/cx";
import IconButton from "@/components/ui/IconButton/IconButton";
import Popover from "@/components/ui/Popover/Popover";
import { INK_COLORS } from "./extensions";
import styles from "./RichTextEditor.module.css";

/** Color de texto y resaltador. */
export default function ColorMenu({ editor, color, highlight }) {
  const rows = [
    {
      id: "ink",
      title: "Color del texto",
      current: color,
      set: (value) => editor.chain().focus().setColor(value).run(),
      unset: () => editor.chain().focus().unsetColor().run(),
    },
    {
      id: "mark",
      title: "Resaltado",
      current: highlight,
      set: (value) => editor.chain().focus().setHighlight({ color: value }).run(),
      unset: () => editor.chain().focus().unsetHighlight().run(),
    },
  ];

  return (
    <Popover
      label="Colores"
      trigger={(props) => (
        <IconButton
          {...props}
          icon={Palette}
          label="Colores"
          size="sm"
          tooltipSide="bottom"
          active={Boolean(color || highlight)}
          onMouseDown={(event) => event.preventDefault()}
        />
      )}
    >
      {({ close }) => (
        <div className={styles.colorMenu}>
          {rows.map((row) => (
            <fieldset key={row.id} className={styles.colorRow}>
              <legend>{row.title}</legend>
              <div className={styles.colorOptions}>
                <button
                  type="button"
                  className={cx(styles.colorOption, styles.colorNone)}
                  aria-pressed={!row.current}
                  aria-label="Sin color"
                  title="Sin color"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => {
                    row.unset();
                    close();
                  }}
                >
                  <Ban aria-hidden />
                </button>
                {INK_COLORS.map((option) => {
                  const value = option[row.id];
                  return (
                    <button
                      key={option.id}
                      type="button"
                      className={cx(styles.colorOption, styles[`${row.id}Option`])}
                      style={{ "--option": value }}
                      aria-pressed={row.current === value}
                      aria-label={option.label}
                      title={option.label}
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() => {
                        row.set(value);
                        close();
                      }}
                    >
                      A
                    </button>
                  );
                })}
              </div>
            </fieldset>
          ))}
        </div>
      )}
    </Popover>
  );
}
