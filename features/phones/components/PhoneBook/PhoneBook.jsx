"use client";

import { useDeferredValue, useMemo, useState } from "react";
import { Phone, Plus, SearchX } from "lucide-react";
import { matchesSearch, searchTerms } from "@/lib/utils/search";
import { useCollection } from "@/lib/hooks/useCollection";
import { useMutation } from "@/lib/hooks/useMutation";
import { createPhone, deletePhone, updatePhone } from "@/features/phones/actions";
import Button from "@/components/ui/Button/Button";
import ConfirmDialog from "@/components/ui/ConfirmDialog/ConfirmDialog";
import EmptyState from "@/components/ui/EmptyState/EmptyState";
import SearchBar from "@/components/ui/SearchBar/SearchBar";
import PhoneTable from "../PhoneTable/PhoneTable";
import PhoneFormModal from "../PhoneFormModal/PhoneFormModal";
import styles from "./PhoneBook.module.css";

const collator = new Intl.Collator("es", { sensitivity: "base", numeric: true });

function comparePhones(a, b) {
  // Los que no tienen oficina van al final.
  if (!a.office !== !b.office) return a.office ? -1 : 1;
  return collator.compare(a.office ?? "", b.office ?? "") || collator.compare(a.agent ?? "", b.agent ?? "");
}

export default function PhoneBook({ initialPhones }) {
  const phones = useCollection(initialPhones);
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);
  const [editing, setEditing] = useState(null); // null | "new" | phone
  const [deleting, setDeleting] = useState(null);

  const [create, creating] = useMutation(createPhone, { successMessage: "Interno agregado" });
  const [update, updating] = useMutation(updatePhone, { successMessage: "Cambios guardados" });
  const [remove, removing] = useMutation(deletePhone, { successMessage: "Interno borrado" });

  const terms = useMemo(() => searchTerms(deferredQuery), [deferredQuery]);
  const visible = useMemo(
    () =>
      phones.items
        .filter((phone) => matchesSearch([phone.office, phone.agent, phone.phone], terms))
        .toSorted(comparePhones),
    [phones.items, terms],
  );

  async function handleSave(data) {
    const result = editing === "new" ? await create(data) : await update({ id: editing.id, data });
    if (!result.ok) return;
    phones.upsert(result.data);
    setEditing(null);
  }

  async function handleDelete() {
    const result = await remove(deleting.id);
    if (!result.ok) return;
    phones.remove(deleting.id);
    setDeleting(null);
  }

  const total = phones.items.length;

  return (
    <div className={styles.book}>
      {total > 0 && (
        <div className={styles.toolbar}>
          <SearchBar
            value={query}
            onChange={setQuery}
            label="Buscar internos"
            placeholder="Buscá por oficina, agente o número"
            className={styles.search}
          />
          <p className={styles.count} aria-live="polite">
            {terms.length ? `${visible.length} de ${total}` : `${total} ${total === 1 ? "interno" : "internos"}`}
          </p>
          <Button variant="primary" icon={Plus} onClick={() => setEditing("new")} className={styles.add}>
            Nuevo interno
          </Button>
        </div>
      )}

      {total === 0 ? (
        <EmptyState
          icon={Phone}
          title="Todavía no hay internos"
          description="Anotá la oficina, quién atiende y el número. Ningún dato es obligatorio."
          action={
            <Button variant="primary" icon={Plus} onClick={() => setEditing("new")}>
              Agregar el primero
            </Button>
          }
        />
      ) : visible.length === 0 ? (
        <EmptyState
          compact
          icon={SearchX}
          title="No hay coincidencias"
          description={`Nada coincide con “${deferredQuery.trim()}”.`}
          action={
            <Button variant="ghost" onClick={() => setQuery("")}>
              Limpiar búsqueda
            </Button>
          }
        />
      ) : (
        <PhoneTable phones={visible} terms={terms} onEdit={setEditing} onDelete={setDeleting} />
      )}

      <PhoneFormModal
        open={editing !== null}
        phone={editing === "new" ? null : editing}
        saving={creating || updating}
        onClose={() => setEditing(null)}
        onSave={handleSave}
      />

      <ConfirmDialog
        open={deleting !== null}
        onClose={() => setDeleting(null)}
        onConfirm={handleDelete}
        loading={removing}
        title="¿Borrar este interno?"
        description={deleting ? describePhone(deleting) : undefined}
      />
    </div>
  );
}

function describePhone(phone) {
  return [phone.office, phone.agent, phone.phone].filter(Boolean).join(" · ") || "Es una fila vacía.";
}
