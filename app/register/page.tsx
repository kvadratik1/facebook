"use client";

import Link from "next/link";
import { useActionState } from "react";
import { registerUser } from "../actions/users";
import styles from "../components/auth.module.css";

export default function RegisterPage() {
  const [state, formAction, pending] = useActionState(registerUser, { message: "" });
  return (
    <main className={styles.page}>
      <section className={styles.story}>
        <p className={styles.eyebrow}>Make yourself at home</p>
        <h1>Your voice<br />belongs here.</h1>
        <p className={styles.description}>A place for everyday thoughts, small discoveries, and the people who make them worth sharing.</p>
        <p className={styles.note}>Something on your mind? This is a good place to start.</p>
      </section>
      <section className={styles.card} aria-labelledby="register-title">
        <h2 id="register-title">Join the conversation.</h2>
        <p className={styles.subtitle}>Create your account and make your first connection.</p>
        <form className={styles.form} action={formAction} aria-busy={pending}>
          <label className={styles.field}>Your name<input type="text" name="name" placeholder="How should we call you?" autoComplete="name" required /></label>
          <label className={styles.field}>Username<input type="text" name="username" placeholder="Choose a username" autoComplete="username" autoCapitalize="none" spellCheck={false} required /></label>
          <label className={styles.field}>Password<input type="password" name="password" placeholder="Create a password" autoComplete="new-password" required /></label>
          <p className={styles.error} aria-live="polite">{state.message}</p>
          <button className={styles.submit} type="submit" disabled={pending}>{pending ? "Creating your account…" : "Create account →"}</button>
        </form>
        <p className={styles.footer}>Already part of the conversation? <Link href="/login">Log in</Link></p>
      </section>
    </main>
  );
}
