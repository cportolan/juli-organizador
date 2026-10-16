"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { useToast } from "@/components/ui/Toast/Toast";
import styles from "./CopyPhoneButton.module.css";

const COPIED_MS = 1600;

/** Número de teléfono que se copia al portapapeles con un clic. */
export default function CopyPhoneButton({ phone, children }) {
  const toast = useToast();
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(phone);
      setCopied(true);
      setTimeout(() => setCopied(false), COPIED_MS);
    } catch {
      toast.error("No se pudo copiar el número.");
    }
  }

  const Icon = copied ? Check : Copy;

  return (
    <button
      type="button"
      className={styles.button}
      data-copied={copied}
      onClick={copy}
      aria-label={`Copiar ${phone}`}
      title={copied ? "Copiado" : "Copiar"}
    >
      <span className={styles.number}>{children}</span>
      <Icon className={styles.icon} aria-hidden />
      <span className="visually-hidden" aria-live="polite">
        {copied ? "Copiado" : ""}
      </span>
    </button>
  );
}
