import LoginForm from "@/features/auth/components/LoginForm/LoginForm";
import LoginArt from "@/features/auth/components/LoginArt/LoginArt";
import styles from "./page.module.css";

export const metadata = { title: "Ingresar" };

export default function LoginPage() {
  return (
    <div className={styles.page}>
      <section className={styles.formSide}>
        <div className={styles.formWrapper}>
          <span className={styles.mark} aria-hidden>
            J
          </span>
          <h1 className={styles.title}>
            Hola, <em>Juli.</em>
          </h1>
          <p className={styles.subtitle}>Ingresá para ver tu agenda.</p>
          <LoginForm />
        </div>
      </section>
      <LoginArt />
    </div>
  );
}
