import { Pencil, Trash2 } from "lucide-react";
import { cx } from "@/lib/utils/cx";
import Highlight from "@/components/ui/Highlight/Highlight";
import DropdownMenu from "@/components/ui/DropdownMenu/DropdownMenu";
import IconButton from "@/components/ui/IconButton/IconButton";
import CopyPhoneButton from "../CopyPhoneButton/CopyPhoneButton";
import styles from "./PhoneTable.module.css";

/**
 * Tabla de internos. Las filas seguidas de la misma oficina la muestran
 * una sola vez, para que se lea como una guía agrupada.
 */
export default function PhoneTable({ phones, terms, onEdit, onDelete }) {
  return (
    <div className={styles.wrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th scope="col">Oficina</th>
            <th scope="col">Agente</th>
            <th scope="col">Teléfono</th>
            <th scope="col">
              <span className="visually-hidden">Acciones</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {phones.map((phone, index) => {
            const repeated = index > 0 && phone.office && phone.office === phones[index - 1].office;
            return (
              <tr key={phone.id} className={cx(styles.row, repeated && styles.repeated)}>
                <td className={styles.office}>
                  {phone.office ? (
                    <span className={repeated ? styles.officeRepeated : undefined}>
                      <Highlight text={phone.office} terms={terms} />
                    </span>
                  ) : (
                    <Missing />
                  )}
                </td>
                <td className={styles.agent}>
                  {phone.agent ? <Highlight text={phone.agent} terms={terms} /> : <Missing />}
                </td>
                <td className={styles.phone}>
                  {phone.phone ? (
                    <CopyPhoneButton phone={phone.phone}>
                      <Highlight text={phone.phone} terms={terms} />
                    </CopyPhoneButton>
                  ) : (
                    <Missing />
                  )}
                </td>
                <td className={styles.actions}>
                  <span className={styles.inlineActions}>
                    <IconButton icon={Pencil} label="Editar" size="sm" onClick={() => onEdit(phone)} />
                    <IconButton icon={Trash2} label="Borrar" size="sm" onClick={() => onDelete(phone)} />
                  </span>
                  {/* En el teléfono no hay hover: las acciones van en un menú */}
                  <DropdownMenu
                    label={`Opciones de ${phone.agent || phone.office || phone.phone || "este interno"}`}
                    className={styles.menu}
                    items={[
                      { id: "edit", label: "Editar", icon: Pencil, onSelect: () => onEdit(phone) },
                      { separator: true },
                      { id: "delete", label: "Borrar", icon: Trash2, tone: "danger", onSelect: () => onDelete(phone) },
                    ]}
                  />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function Missing() {
  return (
    <span className={styles.missing} aria-label="Sin dato">
      —
    </span>
  );
}
