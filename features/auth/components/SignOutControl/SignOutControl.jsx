"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { signOut } from "@/features/auth/actions";
import { useToast } from "@/components/ui/Toast/Toast";
import Button from "@/components/ui/Button/Button";
import ConfirmDialog from "@/components/ui/ConfirmDialog/ConfirmDialog";
import IconButton from "@/components/ui/IconButton/IconButton";

/**
 * Cerrar sesión con confirmación. `variant="icon"` es el botón del sidebar;
 * `variant="button"` el de Configuración (en el celular no hay sidebar).
 */
export default function SignOutControl({ variant = "icon", tooltipSide = "right" }) {
  const router = useRouter();
  const toast = useToast();
  const [confirming, setConfirming] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  async function handleSignOut() {
    setSigningOut(true);
    const result = await signOut().catch(() => ({ ok: false, error: "No se pudo cerrar la sesión." }));
    if (!result.ok) {
      setSigningOut(false);
      toast.error(result.error);
      return;
    }
    router.replace("/login");
    router.refresh();
  }

  return (
    <>
      {variant === "icon" ? (
        <IconButton icon={LogOut} label="Cerrar sesión" tooltipSide={tooltipSide} onClick={() => setConfirming(true)} />
      ) : (
        <Button icon={LogOut} onClick={() => setConfirming(true)}>
          Cerrar sesión
        </Button>
      )}
      <ConfirmDialog
        open={confirming}
        onClose={() => setConfirming(false)}
        onConfirm={handleSignOut}
        loading={signingOut}
        title="¿Seguro que querés cerrar sesión?"
        description="Para volver a entrar vas a necesitar tu email y contraseña."
        confirmLabel="Cerrar sesión"
        tone="primary"
      />
    </>
  );
}
