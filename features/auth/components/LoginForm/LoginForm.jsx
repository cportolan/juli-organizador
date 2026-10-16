"use client";

import { useActionState, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Eye, EyeOff, Lock, Mail } from "lucide-react";
import { HOME_PATH } from "@/lib/navigation";
import { signIn } from "@/features/auth/mocks";
import Button from "@/components/ui/Button/Button";
import IconButton from "@/components/ui/IconButton/IconButton";
import Input from "@/components/ui/Input/Input";
import styles from "./LoginForm.module.css";

export default function LoginForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

  const [state, formAction, pending] = useActionState(async (_previous, formData) => {
    const email = formData.get("email")?.toString().trim();
    const password = formData.get("password")?.toString();
    try {
      await signIn({ email, password });
      router.replace(HOME_PATH);
      return { email };
    } catch (error) {
      return { email, error: error.message };
    }
  }, {});

  return (
    <form action={formAction} className={styles.form} noValidate>
      <Input
        label="Email"
        name="email"
        type="email"
        icon={Mail}
        autoComplete="email"
        defaultValue={state.email}
        required
      />
      <Input
        label="Contraseña"
        name="password"
        type={showPassword ? "text" : "password"}
        icon={Lock}
        autoComplete="current-password"
        required
        suffix={
          <IconButton
            icon={showPassword ? EyeOff : Eye}
            label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
            size="sm"
            tooltip={false}
            onClick={() => setShowPassword((value) => !value)}
          />
        }
      />

      {state.error && (
        <p className={styles.error} role="alert">
          {state.error}
        </p>
      )}

      <Button type="submit" variant="primary" size="lg" iconRight={ArrowRight} loading={pending} fullWidth>
        Ingresar
      </Button>
    </form>
  );
}
