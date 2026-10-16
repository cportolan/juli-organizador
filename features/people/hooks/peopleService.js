// Único punto de acceso de la UI de Usuarios a las Server Actions de people.
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
} from "@/features/people/actions";
// Los adjuntos suben directo del navegador a Storage (Vercel corta los requests en 4,5 MB).
export { uploadAttachmentFile as uploadAttachment } from "@/features/people/uploadAttachmentFile";
