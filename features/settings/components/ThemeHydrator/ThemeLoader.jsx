import { connection } from "next/server";
import { getSettings } from "@/features/settings/api";
import ThemeHydrator from "./ThemeHydrator";

/** Lee la configuración del usuario en el servidor y la pasa al cliente. */
export default async function ThemeLoader() {
  // Depende de la sesión: se resuelve en cada request (el cliente de Supabase lee la hora).
  await connection();
  // Sin configuración disponible se mantiene el tema cacheado en el navegador.
  const settings = await getSettings().catch(() => null);
  if (!settings) return null;
  return <ThemeHydrator settings={settings} />;
}
