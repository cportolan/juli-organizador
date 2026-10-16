const sizeFormat = new Intl.NumberFormat("es-AR", { maximumFractionDigits: 1 });

/** "182 KB", "1,4 MB". */
export function formatFileSize(bytes) {
  if (!Number.isFinite(bytes)) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 ** 2) return `${sizeFormat.format(bytes / 1024)} KB`;
  return `${sizeFormat.format(bytes / 1024 ** 2)} MB`;
}

/** Nombre de archivo sin extensión, para sugerir un título. */
export function fileTitle(fileName) {
  return fileName.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ").trim();
}
