"use client";

import RouteError from "@/components/layout/RouteError/RouteError";

export default function CalendarError(props) {
  return <RouteError {...props} title="No se pudo cargar el calendario" />;
}
