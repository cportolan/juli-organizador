// Mocks de la sección Usuarios con la misma forma que el contrato de TASKS.md.
// Se usan hasta que exista features/people/actions.js; la UI los importa solo
// desde features/people/hooks/peopleService.js. Borrar cuando esté el backend.

const MOCK_SECTION_PASSWORD = "juli1234";
const MOCK_PERSON_PASSWORD = "secreto1";
export const MOCK_UNLOCK_COOKIE = "oj-people-mock-unlocked";

const wait = (ms = 250) => new Promise((resolve) => setTimeout(resolve, ms));
const ok = (data) => ({ ok: true, data });
const fail = (error) => ({ ok: false, error });
const now = () => new Date().toISOString();

const doc = (...paragraphs) => ({
  type: "doc",
  content: paragraphs.map((text) => ({ type: "paragraph", content: text ? [{ type: "text", text }] : [] })),
});

export const MOCK_PEOPLE = [
  { id: "person-1", name: "Marta Gómez", position: 0, hasPassword: false },
  { id: "person-2", name: "Luis Pereyra", position: 1, hasPassword: true },
  { id: "person-3", name: "Ana Belén Sosa", position: 2, hasPassword: false },
];

const contents = {
  "person-1": doc("Ingresó en marzo de 2024. Prefiere que le escriban por mail.", "Cumple el 14 de mayo."),
  "person-2": doc("Ficha con contraseña (en los mocks es “secreto1”)."),
  "person-3": null,
};

const passwords = { "person-2": MOCK_PERSON_PASSWORD };

const attachments = {
  "person-1": [
    {
      id: "att-1",
      personId: "person-1",
      title: "Alta en el sistema",
      fileName: "alta-sistema.pdf",
      mimeType: "application/pdf",
      size: 182_400,
      url: "data:application/pdf;base64,",
      createdAt: "2026-10-02T13:00:00.000Z",
    },
  ],
};

let people = MOCK_PEOPLE.map((person) => ({ ...person }));
let nextId = 10;

export async function unlockPeopleSection(password) {
  await wait();
  if (password !== MOCK_SECTION_PASSWORD) return fail("La contraseña no es correcta.");
  document.cookie = `${MOCK_UNLOCK_COOKIE}=1; path=/; max-age=1800; samesite=lax`;
  return ok({ unlocked: true });
}

export async function getPerson({ id, password } = {}) {
  await wait();
  const person = people.find((item) => item.id === id);
  if (!person) return fail("No se encontró la ficha.");
  if (passwords[id] && passwords[id] !== password) {
    return fail(password ? "La contraseña de la ficha no es correcta." : "Esta ficha tiene contraseña.");
  }
  return ok({ ...person, content: contents[id] ?? null });
}

export async function createPerson({ name } = {}) {
  await wait();
  if (!name?.trim()) return fail("Escribí un nombre.");
  const person = { id: `person-${nextId++}`, name: name.trim(), position: people.length, hasPassword: false };
  people = [...people, person];
  return ok(person);
}

export async function renamePerson({ id, name } = {}) {
  await wait();
  if (!name?.trim()) return fail("Escribí un nombre.");
  people = people.map((person) => (person.id === id ? { ...person, name: name.trim() } : person));
  return ok(people.find((person) => person.id === id));
}

export async function reorderPeople(ids) {
  await wait(120);
  people = ids.map((id, position) => ({ ...people.find((person) => person.id === id), position }));
  return ok(people);
}

export async function deletePerson(id) {
  await wait();
  people = people.filter((person) => person.id !== id);
  return ok({ id });
}

export async function savePersonContent({ id, content } = {}) {
  await wait(400);
  contents[id] = content;
  return ok({ id, updatedAt: now() });
}

export async function setPersonPassword({ id, currentPassword, newPassword } = {}) {
  await wait();
  if (passwords[id] && passwords[id] !== currentPassword) return fail("La contraseña actual no es correcta.");
  if (newPassword !== null && (newPassword ?? "").length < 8) return fail("La contraseña debe tener al menos 8 caracteres.");
  if (newPassword === null) delete passwords[id];
  else passwords[id] = newPassword;
  people = people.map((person) => (person.id === id ? { ...person, hasPassword: newPassword !== null } : person));
  return ok({ hasPassword: newPassword !== null });
}

export async function getAttachments(personId) {
  await wait();
  return ok(attachments[personId] ?? []);
}

export async function uploadAttachment(formData) {
  await wait(700);
  const file = formData.get("file");
  const personId = formData.get("personId");
  const attachment = {
    id: `att-${nextId++}`,
    personId,
    title: formData.get("title") || file.name,
    fileName: file.name,
    mimeType: file.type || "application/octet-stream",
    size: file.size,
    url: URL.createObjectURL(file),
    createdAt: now(),
  };
  attachments[personId] = [attachment, ...(attachments[personId] ?? [])];
  return ok(attachment);
}

export async function renameAttachment({ id, title } = {}) {
  await wait();
  for (const list of Object.values(attachments)) {
    const item = list.find((attachment) => attachment.id === id);
    if (item) {
      item.title = title;
      return ok({ ...item });
    }
  }
  return fail("No se encontró el adjunto.");
}

export async function deleteAttachment(id) {
  await wait();
  for (const key of Object.keys(attachments)) attachments[key] = attachments[key].filter((item) => item.id !== id);
  return ok({ id });
}
