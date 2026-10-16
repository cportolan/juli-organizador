// Mocks de auth mientras Codex implementa features/auth/actions.js.
// Misma firma que el contrato de TASKS.md. Borrar al conectar el backend.

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export async function signIn({ email, password }) {
  await wait(700);
  if (!email || !password) throw new Error("Completá el email y la contraseña.");
  if (password.length < 4) throw new Error("El email o la contraseña no son correctos.");
  return { email };
}

export async function signOut() {
  await wait(300);
}
