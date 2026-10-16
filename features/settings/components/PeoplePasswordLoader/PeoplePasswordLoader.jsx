import { connection } from "next/server";
import { getSettings } from "@/features/settings/api";
import PeoplePasswordSettings from "../PeoplePasswordSettings/PeoplePasswordSettings";

export default async function PeoplePasswordLoader() {
  await connection();
  const settings = await getSettings();
  return <PeoplePasswordSettings initialEnabled={settings.peopleLockEnabled} />;
}
