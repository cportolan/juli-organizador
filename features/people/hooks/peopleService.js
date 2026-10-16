// Único punto de acceso de la UI de Usuarios a los datos. Hoy apunta a los
// mocks; cuando Codex publique features/people/actions.js se cambia este import.
export {
  createPerson,
  deleteAttachment,
  deletePerson,
  getAttachments,
  getPerson,
  renameAttachment,
  renamePerson,
  reorderPeople,
  savePersonContent,
  setPersonPassword,
  unlockPeopleSection,
  uploadAttachment,
} from "@/features/people/mocks";
