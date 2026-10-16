"use client";

import { ArrowLeft, ArrowRight, KeyRound, Lock, Pencil, RotateCw, Trash2 } from "lucide-react";
import { useAutosave } from "@/lib/hooks/useAutosave";
import Button from "@/components/ui/Button/Button";
import DropdownMenu from "@/components/ui/DropdownMenu/DropdownMenu";
import RichTextEditor from "@/components/ui/RichTextEditor/RichTextEditor";
import SaveStatus from "@/components/ui/SaveStatus/SaveStatus";
import Skeleton from "@/components/ui/Skeleton/Skeleton";
import { usePersonContent } from "../../hooks/usePersonContent";
import AttachmentsPanel from "../AttachmentsPanel/AttachmentsPanel";
import PersonUnlock from "../PersonUnlock/PersonUnlock";
import styles from "./PersonPanel.module.css";

/**
 * Hoja de una ficha: encabezado, editor con autoguardado y adjuntos.
 * Se monta con key = id: al cambiar de pestaña se guarda lo pendiente y,
 * si la ficha tiene contraseña, se vuelve a bloquear.
 */
export default function PersonPanel({ person, index, total, onRename, onPassword, onMove, onDelete }) {
  const content = usePersonContent(person);
  const { schedule, status } = useAutosave(content.save);

  const menu = [
    { id: "rename", label: "Cambiar nombre", icon: Pencil, onSelect: onRename },
    { id: "password", label: person.hasPassword ? "Contraseña…" : "Poner contraseña", icon: KeyRound, onSelect: onPassword },
    { separator: true },
    ...(index > 0 ? [{ id: "left", label: "Mover a la izquierda", icon: ArrowLeft, onSelect: () => onMove(index - 1) }] : []),
    ...(index < total - 1 ? [{ id: "right", label: "Mover a la derecha", icon: ArrowRight, onSelect: () => onMove(index + 1) }] : []),
    { separator: true },
    { id: "delete", label: "Borrar ficha", icon: Trash2, tone: "danger", onSelect: onDelete },
  ].filter((item, position, list) => !(item.separator && list[position - 1]?.separator));

  return (
    <div id="person-panel" role="tabpanel" aria-labelledby={`person-tab-${person.id}`} className={styles.sheet}>
      <header className={styles.header}>
        <h2 className={styles.name}>
          <button type="button" onClick={onRename} title="Cambiar nombre">
            {person.name}
          </button>
        </h2>
        {person.hasPassword && (
          <span className={styles.locked} title="Esta ficha tiene contraseña">
            <Lock aria-hidden /> Con contraseña
          </span>
        )}
        <div className={styles.headerEnd}>
          {content.status === "ready" && <SaveStatus status={status} />}
          <DropdownMenu label={`Opciones de la ficha de ${person.name}`} items={menu} />
        </div>
      </header>

      {content.status === "locked" && <PersonUnlock name={person.name} error={content.error} onUnlock={content.unlock} />}

      {content.status === "loading" && (
        <div className={styles.loading} aria-busy="true" aria-label="Cargando ficha">
          <Skeleton width="40%" height={22} />
          <Skeleton height={14} />
          <Skeleton width="85%" height={14} />
          <Skeleton width="60%" height={14} />
        </div>
      )}

      {content.status === "error" && (
        <div className={styles.error}>
          <p>{content.error ?? "No se pudo cargar la ficha."}</p>
          <Button icon={RotateCw} onClick={content.retry}>
            Reintentar
          </Button>
        </div>
      )}

      {content.status === "ready" && (
        <div className={styles.body}>
          <RichTextEditor
            content={content.content}
            onChange={schedule}
            placeholder={`Anotá lo que quieras recordar de ${person.name}…`}
            label={`Notas sobre ${person.name}`}
            className={styles.editor}
          />
          <aside className={styles.side}>
            <AttachmentsPanel personId={person.id} />
          </aside>
        </div>
      )}
    </div>
  );
}
