"use client";

import { Columns2, Rows2, Table, Trash2 } from "lucide-react";
import DropdownMenu from "@/components/ui/DropdownMenu/DropdownMenu";

/** Insertar una tabla y, dentro de una, agregar o quitar filas y columnas. */
export default function TableMenu({ editor, inTable }) {
  const run = (command) => () => command(editor.chain().focus()).run();

  const items = inTable
    ? [
        { id: "row-after", label: "Agregar fila abajo", icon: Rows2, onSelect: run((chain) => chain.addRowAfter()) },
        { id: "col-after", label: "Agregar columna a la derecha", icon: Columns2, onSelect: run((chain) => chain.addColumnAfter()) },
        { separator: true },
        { id: "row-delete", label: "Borrar fila", icon: Rows2, tone: "danger", onSelect: run((chain) => chain.deleteRow()) },
        { id: "col-delete", label: "Borrar columna", icon: Columns2, tone: "danger", onSelect: run((chain) => chain.deleteColumn()) },
        { id: "table-delete", label: "Borrar tabla", icon: Trash2, tone: "danger", onSelect: run((chain) => chain.deleteTable()) },
      ]
    : [
        {
          id: "insert",
          label: "Insertar tabla de 3 × 3",
          icon: Table,
          onSelect: run((chain) => chain.insertTable({ rows: 3, cols: 3, withHeaderRow: true })),
        },
      ];

  return <DropdownMenu label="Tabla" icon={Table} items={items} align="start" />;
}
