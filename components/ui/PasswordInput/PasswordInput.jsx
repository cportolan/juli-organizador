"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import IconButton from "@/components/ui/IconButton/IconButton";
import Input from "@/components/ui/Input/Input";

/** Campo de contraseña con botón para mostrarla u ocultarla. */
export default function PasswordInput({ autoComplete = "current-password", ...props }) {
  const [visible, setVisible] = useState(false);

  return (
    <Input
      type={visible ? "text" : "password"}
      autoComplete={autoComplete}
      spellCheck={false}
      suffix={
        <IconButton
          icon={visible ? EyeOff : Eye}
          label={visible ? "Ocultar contraseña" : "Mostrar contraseña"}
          size="sm"
          tooltip={false}
          onClick={() => setVisible((value) => !value)}
        />
      }
      {...props}
    />
  );
}
