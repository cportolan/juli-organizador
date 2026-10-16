import { cookies } from "next/headers";
import { MOCK_PEOPLE, MOCK_UNLOCK_COOKIE } from "./mocks";

// Lecturas mock del lado del servidor (getPeople, isPeopleSectionUnlocked).
// Se reemplazan por features/people/api.js cuando exista. Borrar con mocks.js.

export async function getPeople() {
  return MOCK_PEOPLE.map((person) => ({ ...person }));
}

export async function isPeopleSectionUnlocked() {
  const store = await cookies();
  return store.get(MOCK_UNLOCK_COOKIE)?.value === "1";
}
