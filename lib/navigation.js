import { BookUser, CalendarDays, ListTodo, Phone, Settings } from "lucide-react";

export const MAIN_NAV = [
  { href: "/calendario", label: "Calendario", icon: CalendarDays },
  { href: "/pendientes", label: "Pendientes", icon: ListTodo },
  { href: "/telefonos", label: "Teléfonos", icon: Phone },
  { href: "/usuarios", label: "Usuarios", icon: BookUser },
];

export const SETTINGS_NAV = { href: "/configuracion", label: "Configuración", icon: Settings };

export const HOME_PATH = MAIN_NAV[0].href;
