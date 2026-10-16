"use client";

import { useEditorState } from "@tiptap/react";
import {
  Bold,
  Italic,
  List,
  ListChecks,
  ListOrdered,
  Minus,
  Quote,
  Redo2,
  Strikethrough,
  Underline,
  Undo2,
} from "lucide-react";
import IconButton from "@/components/ui/IconButton/IconButton";
import HeadingSelect from "./HeadingSelect";
import ColorMenu from "./ColorMenu";
import LinkMenu from "./LinkMenu";
import TableMenu from "./TableMenu";
import styles from "./RichTextEditor.module.css";

const MARKS = [
  { id: "bold", label: "Negrita (Ctrl+B)", icon: Bold, run: (chain) => chain.toggleBold() },
  { id: "italic", label: "Cursiva (Ctrl+I)", icon: Italic, run: (chain) => chain.toggleItalic() },
  { id: "underline", label: "Subrayado (Ctrl+U)", icon: Underline, run: (chain) => chain.toggleUnderline(), full: true },
  { id: "strike", label: "Tachado", icon: Strikethrough, run: (chain) => chain.toggleStrike() },
];

const BLOCKS = [
  { id: "bulletList", label: "Lista con viñetas", icon: List, run: (chain) => chain.toggleBulletList() },
  { id: "orderedList", label: "Lista numerada", icon: ListOrdered, run: (chain) => chain.toggleOrderedList(), full: true },
  { id: "taskList", label: "Lista de tareas", icon: ListChecks, run: (chain) => chain.toggleTaskList() },
  { id: "blockquote", label: "Cita", icon: Quote, run: (chain) => chain.toggleBlockquote(), full: true },
];

function selectState({ editor }) {
  if (!editor) return null;
  const active = {};
  for (const { id } of [...MARKS, ...BLOCKS]) active[id] = editor.isActive(id);
  return {
    active,
    heading: [1, 2, 3].find((level) => editor.isActive("heading", { level })) ?? 0,
    color: editor.getAttributes("textStyle").color ?? null,
    highlight: editor.isActive("highlight") ? (editor.getAttributes("highlight").color ?? null) : null,
    link: editor.isActive("link") ? (editor.getAttributes("link").href ?? "") : null,
    inTable: editor.isActive("table"),
    canUndo: editor.can().undo(),
    canRedo: editor.can().redo(),
  };
}

/** Barra de herramientas del editor. Se mantiene fija arriba al hacer scroll. */
export default function EditorToolbar({ editor, compact, extra }) {
  const state = useEditorState({ editor, selector: selectState });

  if (!state) return <div className={styles.toolbar} aria-hidden />;

  const run = (command) => command(editor.chain().focus()).run();
  const button = (item) => (
    <IconButton
      key={item.id}
      icon={item.icon}
      label={item.label}
      size="sm"
      active={state.active[item.id]}
      aria-pressed={state.active[item.id]}
      tooltipSide="bottom"
      onMouseDown={(event) => event.preventDefault()}
      onClick={() => run(item.run)}
    />
  );

  return (
    <div className={styles.toolbar} role="toolbar" aria-label="Formato de texto">
      {!compact && (
        <>
          <HeadingSelect editor={editor} value={state.heading} />
          <span className={styles.divider} aria-hidden />
        </>
      )}
      {MARKS.filter((item) => !compact || !item.full).map(button)}
      <ColorMenu editor={editor} color={state.color} highlight={state.highlight} />
      <span className={styles.divider} aria-hidden />
      {BLOCKS.filter((item) => !compact || !item.full).map(button)}
      <LinkMenu editor={editor} href={state.link} />
      {!compact && (
        <>
          <TableMenu editor={editor} inTable={state.inTable} />
          <IconButton
            icon={Minus}
            label="Línea divisoria"
            size="sm"
            tooltipSide="bottom"
            onClick={() => run((chain) => chain.setHorizontalRule())}
          />
        </>
      )}
      <span className={styles.spacer} />
      {extra}
      {!compact && (
        <>
          <IconButton
            icon={Undo2}
            label="Deshacer (Ctrl+Z)"
            size="sm"
            tooltipSide="bottom"
            disabled={!state.canUndo}
            onClick={() => run((chain) => chain.undo())}
          />
          <IconButton
            icon={Redo2}
            label="Rehacer (Ctrl+Shift+Z)"
            size="sm"
            tooltipSide="bottom"
            disabled={!state.canRedo}
            onClick={() => run((chain) => chain.redo())}
          />
        </>
      )}
    </div>
  );
}
