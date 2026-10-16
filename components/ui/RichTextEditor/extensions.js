import StarterKit from "@tiptap/starter-kit";
import { Color, TextStyle } from "@tiptap/extension-text-style";
import Highlight from "@tiptap/extension-highlight";
import { TaskItem, TaskList } from "@tiptap/extension-list";
import { TableKit } from "@tiptap/extension-table";
import { Placeholder } from "@tiptap/extensions";

/** Colores de texto y de resaltado (variables de globals.css, se adaptan al modo oscuro). */
export const INK_COLORS = [
  { id: "rose", label: "Rosa" },
  { id: "peach", label: "Durazno" },
  { id: "butter", label: "Mostaza" },
  { id: "sage", label: "Verde" },
  { id: "sky", label: "Azul" },
  { id: "lilac", label: "Lila" },
].map((color) => ({ ...color, ink: `var(--ink-${color.id})`, mark: `var(--mark-${color.id})` }));

export function createExtensions({ placeholder, compact }) {
  return [
    StarterKit.configure({
      heading: { levels: compact ? [2, 3] : [1, 2, 3] },
      codeBlock: false,
      code: false,
      link: {
        openOnClick: false,
        autolink: true,
        defaultProtocol: "https",
        HTMLAttributes: { rel: "noopener noreferrer", target: "_blank" },
      },
    }),
    TextStyle,
    Color,
    Highlight.configure({ multicolor: true }),
    TaskList,
    TaskItem.configure({
      nested: true,
      a11y: {
        checkboxLabel: (node, checked) =>
          `${checked ? "Desmarcar" : "Marcar"} “${node.textContent || "tarea vacía"}”`,
      },
    }),
    TableKit.configure({ table: { resizable: !compact } }),
    Placeholder.configure({ placeholder }),
  ];
}
