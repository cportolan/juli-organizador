"use client";

import { useCallback, useEffect, useState } from "react";
import { useMutation } from "@/lib/hooks/useMutation";
import { deleteAttachment, getAttachments, renameAttachment, uploadAttachment } from "./peopleService";

/** Adjuntos de una ficha: lista, subida, renombre y borrado. */
export function useAttachments(personId) {
  const [state, setState] = useState({ status: "loading", items: [] });
  const [runUpload, uploading] = useMutation(uploadAttachment, { successMessage: "Archivo adjuntado" });
  const [runRename] = useMutation(renameAttachment);
  const [runDelete, deleting] = useMutation(deleteAttachment, { successMessage: "Adjunto borrado" });

  const load = useCallback(async () => {
    try {
      const result = await getAttachments(personId);
      setState(result.ok ? { status: "ready", items: result.data } : { status: "error", items: [] });
    } catch {
      setState({ status: "error", items: [] });
    }
  }, [personId]);

  useEffect(() => {
    let active = true;
    getAttachments(personId)
      .then((result) => active && setState(result.ok ? { status: "ready", items: result.data } : { status: "error", items: [] }))
      .catch(() => active && setState({ status: "error", items: [] }));
    return () => {
      active = false;
    };
  }, [personId]);

  const setItems = (update) => setState((current) => ({ ...current, items: update(current.items) }));

  async function upload({ file, title }) {
    const formData = new FormData();
    formData.set("personId", personId);
    formData.set("title", title);
    formData.set("file", file);
    const result = await runUpload(formData);
    if (result.ok) setItems((items) => [result.data, ...items]);
    return result;
  }

  async function rename(id, title) {
    const result = await runRename({ id, title });
    if (result.ok) setItems((items) => items.map((item) => (item.id === id ? { ...item, title: result.data.title } : item)));
    return result;
  }

  async function remove(id) {
    const result = await runDelete(id);
    if (result.ok) setItems((items) => items.filter((item) => item.id !== id));
    return result;
  }

  return { ...state, retry: load, upload, rename, remove, uploading, deleting };
}
