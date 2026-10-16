"use client";

import RouteError from "@/components/layout/RouteError/RouteError";

export default function PeopleError(props) {
  return <RouteError {...props} title="No se pudieron cargar las fichas" />;
}
