"use client";

import { ChevronDown } from "lucide-react";
import styles from "./RichTextEditor.module.css";

const OPTIONS = [
  { value: 0, label: "Texto" },
  { value: 1, label: "Título" },
  { value: 2, label: "Subtítulo" },
  { value: 3, label: "Encabezado" },
];

/** Tipo de bloque: texto normal o títulos. */
export default function HeadingSelect({ editor, value }) {
  function handleChange(event) {
    const level = Number(event.target.value);
    const chain = editor.chain().focus();
    (level ? chain.setHeading({ level }) : chain.setParagraph()).run();
  }

  return (
    <span className={styles.headingSelect}>
      <select value={value} onChange={handleChange} aria-label="Tipo de texto">
        {OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDown aria-hidden />
    </span>
  );
}
