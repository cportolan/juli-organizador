import styles from "./LoginArt.module.css";

// Un mes abstracto: celdas de calendario, algunas pintadas con los tonos
// pastel de la app, que aparecen en cascada. Puramente decorativo.
const FILLED = {
  3: "sage",
  8: "peach",
  9: "peach",
  12: "sky",
  17: "butter",
  19: "rose",
  22: "lilac",
  23: "lilac",
  24: "lilac",
  27: "mint",
  31: "sky",
};
const CELLS = Array.from({ length: 35 }, (_, index) => index);
const WEEKDAYS = ["L", "M", "M", "J", "V", "S", "D"];

export default function LoginArt() {
  return (
    <section className={styles.art} aria-hidden>
      <div className={styles.calendar}>
        {WEEKDAYS.map((day, index) => (
          <span key={index} className={styles.weekday}>
            {day}
          </span>
        ))}
        {CELLS.map((cell) => (
          <span
            key={cell}
            className={styles.cell}
            data-tone={FILLED[cell]}
            style={{ "--delay": `${(cell % 7) * 40 + Math.floor(cell / 7) * 70}ms` }}
          >
            {cell >= 2 && cell <= 32 && <span className={styles.number}>{cell - 1}</span>}
          </span>
        ))}
      </div>
    </section>
  );
}
