"use client";

import { useState } from "react";
import { BookUser, Plus } from "lucide-react";
import { useStoredState } from "@/lib/hooks/useStoredState";
import Button from "@/components/ui/Button/Button";
import ConfirmDialog from "@/components/ui/ConfirmDialog/ConfirmDialog";
import EmptyState from "@/components/ui/EmptyState/EmptyState";
import PromptDialog from "@/components/ui/PromptDialog/PromptDialog";
import { usePeopleList } from "../../hooks/usePeopleList";
import PeopleTabs from "../PeopleTabs/PeopleTabs";
import PersonPanel from "../PersonPanel/PersonPanel";
import PersonPasswordDialog from "../PersonPasswordDialog/PersonPasswordDialog";
import styles from "./PeopleWorkspace.module.css";

/** Fichas de personas: pestañas arriba y la ficha elegida abajo. */
export default function PeopleWorkspace({ initialPeople }) {
  const list = usePeopleList(initialPeople);
  const [storedId, setActiveId] = useStoredState("oj-people-active", null);
  const [dialog, setDialog] = useState(null); // null | "create" | "rename" | "delete" | "password"

  const active = list.people.find((person) => person.id === storedId) ?? list.people[0] ?? null;
  const activeIndex = active ? list.people.indexOf(active) : -1;
  const close = () => setDialog(null);

  async function handleCreate(name) {
    const result = await list.create(name);
    if (!result.ok) return;
    setActiveId(result.data.id);
    close();
  }

  async function handleRename(name) {
    const result = await list.rename(active.id, name);
    if (result.ok) close();
  }

  async function handleDelete() {
    const neighbor = list.people[activeIndex + 1] ?? list.people[activeIndex - 1] ?? null;
    const result = await list.remove(active.id);
    if (!result.ok) return;
    setActiveId(neighbor?.id ?? null);
    close();
  }

  if (!list.people.length) {
    return (
      <>
        <EmptyState
          icon={BookUser}
          title="Todavía no hay fichas"
          description="Una ficha por persona: notas, datos para recordar y archivos."
          action={
            <Button variant="primary" icon={Plus} onClick={() => setDialog("create")}>
              Crear la primera
            </Button>
          }
        />
        <CreateDialog open={dialog === "create"} loading={list.creating} onClose={close} onSubmit={handleCreate} />
      </>
    );
  }

  return (
    <div className={styles.workspace}>
      <PeopleTabs
        people={list.people}
        activeId={active.id}
        onSelect={setActiveId}
        onAdd={() => setDialog("create")}
        onMove={list.move}
      />
      <PersonPanel
        key={active.id}
        person={active}
        index={activeIndex}
        total={list.people.length}
        onRename={() => setDialog("rename")}
        onPassword={() => setDialog("password")}
        onMove={(toIndex) => list.move(active.id, toIndex)}
        onDelete={() => setDialog("delete")}
      />

      <CreateDialog open={dialog === "create"} loading={list.creating} onClose={close} onSubmit={handleCreate} />
      <PromptDialog
        open={dialog === "rename"}
        onClose={close}
        onSubmit={handleRename}
        title="Cambiar nombre"
        label="Nombre"
        initialValue={active.name}
        loading={list.renaming}
      />
      <ConfirmDialog
        open={dialog === "delete"}
        onClose={close}
        onConfirm={handleDelete}
        loading={list.deleting}
        title={`¿Borrar la ficha de ${active.name}?`}
        description="Se borran sus notas y sus adjuntos. No se puede deshacer."
      />
      <PersonPasswordDialog
        person={dialog === "password" ? active : null}
        onClose={close}
        onChanged={(id, hasPassword) => list.patch(id, { hasPassword })}
      />
    </div>
  );
}

function CreateDialog(props) {
  return <PromptDialog {...props} title="Nueva ficha" label="Nombre" placeholder="Marta Gómez" confirmLabel="Crear" />;
}
