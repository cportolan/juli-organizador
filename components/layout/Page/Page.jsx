import { ViewTransition } from "react";
import { cx } from "@/lib/utils/cx";
import styles from "./Page.module.css";

/**
 * Contenedor de cada página: anima la entrada al navegar y ordena
 * encabezado + contenido. `aside` es el sidebar derecho opcional.
 */
export default function Page({ title, description, actions, toolbar, aside, wide = false, children }) {
  return (
    <div className={styles.layout}>
      <ViewTransition enter="page-enter" exit="page-exit" default="none">
        <div className={cx(styles.page, wide && styles.wide)}>
          <header className={styles.header}>
            <div className={styles.heading}>
              <h1 className={styles.title}>{title}</h1>
              {description && <p className={styles.description}>{description}</p>}
            </div>
            {actions && <div className={styles.actions}>{actions}</div>}
          </header>
          {toolbar && <div className={styles.toolbar}>{toolbar}</div>}
          <div className={styles.body}>{children}</div>
        </div>
      </ViewTransition>
      {aside}
    </div>
  );
}
