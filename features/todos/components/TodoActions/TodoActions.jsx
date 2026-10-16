"use client";

import { Pencil, Trash2 } from "lucide-react";
import DropdownMenu from "@/components/ui/DropdownMenu/DropdownMenu";
import { otherStatus, statusMeta } from "../todoMeta";

/** Menú de cada pendiente: editar, cambiar de estado y borrar. */
export default function TodoActions({ todo, onEdit, onStatus, onDelete, className }) {
  const next = statusMeta(otherStatus(todo.status));
  return (
    <DropdownMenu
      label={`Opciones de “${todo.title}”`}
      className={className}
      items={[
        { id: "edit", label: "Editar", icon: Pencil, onSelect: () => onEdit(todo) },
        {
          id: "status",
          label: `Pasar a ${next.label.toLowerCase()}`,
          icon: next.icon,
          onSelect: () => onStatus(todo, next.id),
        },
        { separator: true },
        { id: "delete", label: "Borrar", icon: Trash2, tone: "danger", onSelect: () => onDelete(todo) },
      ]}
    />
  );
}
