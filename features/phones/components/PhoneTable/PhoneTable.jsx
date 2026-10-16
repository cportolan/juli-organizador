import { Pencil, Trash2 } from "lucide-react";
import { cx } from "@/lib/utils/cx";
import Highlight from "@/components/ui/Highlight/Highlight";
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
                  <IconButton icon={Pencil} label="Editar" size="sm" onClick={() => onEdit(phone)} />
                  <IconButton icon={Trash2} label="Borrar" size="sm" onClick={() => onDelete(phone)} />
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
