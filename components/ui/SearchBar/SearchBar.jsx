"use client";

import { useRef } from "react";
import { Search, X } from "lucide-react";
import { cx } from "@/lib/utils/cx";
import Input from "@/components/ui/Input/Input";
import IconButton from "@/components/ui/IconButton/IconButton";
import styles from "./SearchBar.module.css";

/** Búsqueda controlada con botón para limpiar (también con Escape). */
export default function SearchBar({ value, onChange, placeholder = "Buscar…", label = "Buscar", className }) {
  const inputRef = useRef(null);

  function clear() {
    onChange("");
    inputRef.current?.focus();
  }

  return (
    <Input
      ref={inputRef}
      type="search"
      icon={Search}
      aria-label={label}
      placeholder={placeholder}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      onKeyDown={(event) => event.key === "Escape" && value && clear()}
      className={cx(styles.search, className)}
      inputClassName={styles.input}
      suffix={value ? <IconButton icon={X} label="Limpiar búsqueda" size="sm" tooltip={false} onClick={clear} /> : null}
    />
  );
}
