"use client";

import { useId } from "react";
import { MapPin, Trash2 } from "lucide-react";
import { TONE_SWATCHES } from "@/lib/utils/tones";
import Button from "@/components/ui/Button/Button";
import Checkbox from "@/components/ui/Checkbox/Checkbox";
import ColorSwatches from "@/components/ui/ColorSwatches/ColorSwatches";
import Input from "@/components/ui/Input/Input";
import Modal from "@/components/ui/Modal/Modal";
import SegmentedControl from "@/components/ui/SegmentedControl/SegmentedControl";
import Textarea from "@/components/ui/Textarea/Textarea";
import { useEventForm } from "../../hooks/useEventForm";
import DateTimeFields from "../DateTimeFields/DateTimeFields";
import RecurrenceField from "../RecurrenceField/RecurrenceField";
import { EVENT_TYPES, eventTypeMeta } from "../eventMeta";
import styles from "./EventFormModal.module.css";

const TYPE_ITEMS = EVENT_TYPES.map(({ id, label, icon }) => ({ id, label, icon }));

/** Alta y edición de eventos, cumpleaños y reuniones. */
export default function EventFormModal({ editing, saving, deleting, onClose, onSave, onDelete }) {
  const formId = useId();
  const event = editing?.event ?? null;

  return (
    <Modal
      open={editing !== null}
      onClose={onClose}
      title={event ? "Editar evento" : "Nuevo evento"}
      size="md"
      footer={
        <>
          {event && (
            <Button variant="ghost" icon={Trash2} onClick={onDelete} loading={deleting} className={styles.delete}>
              Borrar
            </Button>
          )}
          <Button variant="ghost" onClick={onClose} disabled={saving}>
            Cancelar
          </Button>
          <Button variant="primary" type="submit" form={formId} loading={saving}>
            {event ? "Guardar" : "Crear"}
          </Button>
        </>
      }
    >
      {editing && (
        <EventForm
          key={event ? `${event.id}:${event.occurrenceDate}` : JSON.stringify(editing.draft)}
          id={formId}
          event={event}
          draft={editing.draft}
          onSave={onSave}
        />
      )}
    </Modal>
  );
}

function EventForm({ id, event, draft, onSave }) {
  const { form, set, setStart, setType, setPreset, error, toData } = useEventForm(event, draft);
  const typeColor = eventTypeMeta(form.type).color ?? "var(--primary)";

  function handleSubmit(submitEvent) {
    submitEvent.preventDefault();
    const data = toData();
    if (data) onSave(data);
  }

  return (
    <form id={id} className={styles.form} onSubmit={handleSubmit} noValidate>
      <Input
        label="Título"
        value={form.title}
        onChange={(change) => set({ title: change.target.value })}
        placeholder={form.type === "birthday" ? "Cumple de Marta" : form.type === "meeting" ? "Reunión de equipo" : "Turno médico"}
        error={error?.field === "title" ? error.message : undefined}
        autoComplete="off"
        autoFocus
        inputClassName={styles.title}
      />

      <SegmentedControl label="Tipo" items={TYPE_ITEMS} value={form.type} onChange={setType} size="sm" />

      <div className={styles.when}>
        <DateTimeFields form={form} onStart={setStart} onChange={set} error={error?.field === "end" ? error.message : undefined} />
        <Checkbox label="Todo el día" checked={form.allDay} onChange={(change) => set({ allDay: change.target.checked })} />
        <RecurrenceField form={form} onPreset={setPreset} onRule={(rule) => set({ rule })} error={error?.field === "rule" ? error.message : undefined} />
      </div>

      <Input
        label="Lugar"
        optional
        icon={MapPin}
        value={form.location}
        onChange={(change) => set({ location: change.target.value })}
        placeholder="Sala 2, Zoom, consultorio…"
        autoComplete="off"
      />
      <Textarea
        label="Descripción"
        optional
        rows={3}
        value={form.description}
        onChange={(change) => set({ description: change.target.value })}
      />

      <fieldset className={styles.colors}>
        <legend className={styles.legend}>Color</legend>
        <div className={styles.colorRow}>
          <button
            type="button"
            className={styles.auto}
            style={{ "--swatch": typeColor }}
            aria-pressed={form.color === null}
            onClick={() => set({ color: null })}
          >
            Automático
          </button>
          <ColorSwatches
            label="Color del evento"
            options={TONE_SWATCHES}
            value={form.color}
            onChange={(color) => set({ color })}
            size="sm"
          />
        </div>
      </fieldset>
    </form>
  );
}
