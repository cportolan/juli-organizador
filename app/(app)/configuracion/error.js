"use client";

import RouteError from "@/components/layout/RouteError/RouteError";

export default function SettingsError(props) {
  return <RouteError {...props} title="No se pudo cargar la configuración" />;
}
