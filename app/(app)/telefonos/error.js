"use client";

import RouteError from "@/components/layout/RouteError/RouteError";

export default function PhonesError(props) {
  return <RouteError {...props} title="No se pudieron cargar los teléfonos" />;
}
