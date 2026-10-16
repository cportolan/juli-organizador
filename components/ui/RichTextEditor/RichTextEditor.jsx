"use client";

import { useEffect, useMemo, useRef } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import { cx } from "@/lib/utils/cx";
import { createExtensions } from "./extensions";
import EditorToolbar from "./EditorToolbar";
import styles from "./RichTextEditor.module.css";

/**
 * Editor de texto (Tiptap) único de la app: fichas de Usuarios y anotador del día.
 * `content` es el JSON de Tiptap; `onChange(json)` se llama en cada cambio
 * (combinarlo con useAutosave). Para cambiar de documento, usar `key`.
 * variant "full" (toolbar completa) | "compact" (anotador).
 */
export default function RichTextEditor({
  content,
  onChange,
  placeholder = "Escribí acá…",
  label,
  variant = "full",
  editable = true,
  toolbarExtra,
  className,
}) {
  const compact = variant === "compact";
  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  const extensions = useMemo(() => createExtensions({ placeholder, compact }), [placeholder, compact]);

  const editor = useEditor({
    extensions,
    content: content ?? null,
    editable,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: styles.content,
        "aria-label": label ?? placeholder,
        "aria-multiline": "true",
        role: "textbox",
      },
    },
    onUpdate: ({ editor: current }) => onChangeRef.current?.(current.getJSON()),
  });

  return (
    <div className={cx(styles.editor, styles[variant], className)}>
      {/* La barra se monta recién con el editor creado: useEditorState no se entera del cambio de null a editor */}
      {editable &&
        (editor ? (
          <EditorToolbar editor={editor} compact={compact} extra={toolbarExtra} />
        ) : (
          <div className={styles.toolbar} aria-hidden />
        ))}
      {editor ? (
        <EditorContent editor={editor} className={styles.surface} />
      ) : (
        <div className={cx(styles.surface, styles.loading)} aria-hidden />
      )}
    </div>
  );
}
