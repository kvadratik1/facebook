"use client";

import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import styles from "../components/auth.module.css";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (pending) return;
    const formData = new FormData(e.currentTarget);
    setError("");
    setPending(true);
    try {
      const result = await signIn("credentials", {
        username: String(formData.get("username") ?? "").trim(),
        password: formData.get("password"),
        redirect: false,
      });
      if (!result || result.error) {
        setError("That username and password don’t match. Please try again.");
        setPending(false);
      } else {
        router.push("/stream");
        router.refresh();
      }
    } catch {
      setError("We couldn’t log you in. Please try again in a moment.");
      setPending(false);
    }
  };

  return (
    <main className={styles.page}>
      <section className={styles.story}>
        <p className={styles.eyebrow}>Your everyday connection</p>
        <h1>A little space.<br />A lot to share.</h1>
        <p className={styles.description}>Pick up where you left off. Catch up on familiar voices and share what’s on your mind.</p>
        <p className={styles.note}>Good conversations start with a simple thought.</p>
      </section>
      <section className={styles.card} aria-labelledby="login-title">
        <h2 id="login-title">Welcome back.</h2>
        <p className={styles.subtitle}>Log in to join the conversation.</p>
        <form className={styles.form} onSubmit={handleSubmit} aria-busy={pending}>
          <label className={styles.field}>Username<input type="text" name="username" placeholder="Your username" autoComplete="username" autoCapitalize="none" spellCheck={false} required /></label>
          <label className={styles.field}>Password<input type="password" name="password" placeholder="Your password" autoComplete="current-password" required /></label>
          <p className={styles.error} role="alert">{error}</p>
          <button className={styles.submit} type="submit" disabled={pending}>{pending ? "Logging in…" : "Log in →"}</button>
        </form>
        <p className={styles.footer}>New around here? <Link href="/register">Create an account</Link></p>
      </section>
    </main>
  );
}
