"use client";

import RouteError from "@/components/layout/RouteError/RouteError";

export default function TodosError(props) {
  return <RouteError {...props} title="No se pudieron cargar los pendientes" />;
}
