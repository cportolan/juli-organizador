"use client";

import { useEffect } from "react";
import { CloudOff, RotateCw } from "lucide-react";
import Button from "@/components/ui/Button/Button";
import EmptyState from "@/components/ui/EmptyState/EmptyState";
import styles from "./RouteError.module.css";

/** Pantalla de error de una sección (la usan los error.js de cada ruta). */
export default function RouteError({ error, retry, title = "No se pudo cargar esta sección" }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className={styles.wrapper}>
      <EmptyState
        icon={CloudOff}
        title={title}
        description="Puede ser la conexión. Probá de nuevo en un momento."
        action={
          <Button variant="primary" icon={RotateCw} onClick={() => retry()}>
            Reintentar
          </Button>
        }
      />
    </div>
  );
}
