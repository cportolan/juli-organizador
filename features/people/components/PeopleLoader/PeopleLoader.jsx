import { connection } from "next/server";
import { getSettings } from "@/features/settings/api";
import { getPeople, isPeopleSectionUnlocked } from "@/features/people/api";
import PeopleLockScreen from "../PeopleLockScreen/PeopleLockScreen";
import PeopleWorkspace from "../PeopleWorkspace/PeopleWorkspace";

/** Si la sección tiene contraseña y no se desbloqueó, no se manda ningún dato de las fichas. */
export default async function PeopleLoader() {
  await connection();
  const settings = await getSettings();
  if (settings.peopleLockEnabled && !(await isPeopleSectionUnlocked())) return <PeopleLockScreen />;

  const people = await getPeople();
  return <PeopleWorkspace initialPeople={people} />;
}
