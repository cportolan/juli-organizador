"use client";

import { Repeat } from "lucide-react";
import { describeRrule, recurrencePresets } from "@/lib/utils/recurrence";
import Select from "@/components/ui/Select/Select";
import CustomRecurrence from "../CustomRecurrence/CustomRecurrence";
import styles from "./RecurrenceField.module.css";

/** Selector de repetición estilo Google Calendar: opciones rápidas o personalizada. */
export default function RecurrenceField({ form, onPreset, onRule, error }) {
  const presets = recurrencePresets(form.startDate);

  return (
    <div className={styles.field}>
      <div className={styles.row}>
        <Repeat className={styles.icon} aria-hidden />
        <Select
          aria-label="Repetición"
          value={form.presetId}
          onChange={(event) => onPreset(event.target.value)}
          options={presets.map(({ id, label }) => ({ value: id, label }))}
          className={styles.select}
        />
      </div>
      {form.presetId === "custom" && form.rule && (
        <div className={styles.custom}>
          <CustomRecurrence rule={form.rule} startDate={form.startDate} onChange={onRule} />
          <p className={styles.summary}>{describeRrule(form.rule)}</p>
        </div>
      )}
      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
