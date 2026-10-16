"use client";

import { useState } from "react";
import { Plus, Tags } from "lucide-react";
import { TONE_SWATCHES } from "@/lib/utils/tones";
import Button from "@/components/ui/Button/Button";
import ColorSwatches from "@/components/ui/ColorSwatches/ColorSwatches";
import ConfirmDialog from "@/components/ui/ConfirmDialog/ConfirmDialog";
import Drawer from "@/components/ui/Drawer/Drawer";
import EmptyState from "@/components/ui/EmptyState/EmptyState";
import Input from "@/components/ui/Input/Input";
import CategoryRow from "../CategoryRow/CategoryRow";
import { DEFAULT_CATEGORY_COLOR } from "../todoMeta";
import styles from "./CategoryManager.module.css";

/** Panel para crear, renombrar, recolorear y borrar categorías. */
export default function CategoryManager({ open, onClose, categoryList, countByCategory, onDeleted }) {
  const { categories, create, update, remove, creating } = categoryList;
  const [name, setName] = useState("");
  const [color, setColor] = useState(DEFAULT_CATEGORY_COLOR);
  const [deleting, setDeleting] = useState(null);
  const [removing, setRemoving] = useState(false);

  async function handleCreate(event) {
    event.preventDefault();
    if (!name.trim()) return;
    const result = await create({ name, color });
    if (result.ok) setName("");
  }

  async function handleDelete() {
    setRemoving(true);
    const result = await remove(deleting.id);
    setRemoving(false);
    if (!result.ok) return;
    onDeleted(deleting.id);
    setDeleting(null);
  }

  const usedBy = deleting ? (countByCategory.get(deleting.id) ?? 0) : 0;

  return (
    <Drawer open={open} onClose={onClose} title="Categorías" description="Agrupan tus pendientes. Elegí nombre y color.">
      <form className={styles.create} onSubmit={handleCreate}>
        <Input
          label="Nueva categoría"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Trámites"
          autoComplete="off"
          maxLength={40}
        />
        <ColorSwatches label="Color de la nueva categoría" options={TONE_SWATCHES} value={color} onChange={setColor} size="sm" allowCustom />
        <Button type="submit" variant="primary" icon={Plus} loading={creating} disabled={!name.trim()} className={styles.add}>
          Agregar
        </Button>
      </form>

      {categories.length === 0 ? (
        <EmptyState compact icon={Tags} title="Sin categorías" description="Por ejemplo: Trámites, Compras, Equipo." />
      ) : (
        <ul className={styles.list}>
          {categories.map((category) => (
            <CategoryRow
              key={category.id}
              category={category}
              count={countByCategory.get(category.id) ?? 0}
              onUpdate={(data) => update(category.id, data)}
              onDelete={() => setDeleting(category)}
            />
          ))}
        </ul>
      )}

      <ConfirmDialog
        open={deleting !== null}
        onClose={() => setDeleting(null)}
        onConfirm={handleDelete}
        loading={removing}
        title={`¿Borrar “${deleting?.name ?? ""}”?`}
        description={
          usedBy
            ? `${usedBy === 1 ? "El pendiente que la usa queda" : `Los ${usedBy} pendientes que la usan quedan`} sin categoría.`
            : "Ningún pendiente la usa."
        }
      />
    </Drawer>
  );
}
