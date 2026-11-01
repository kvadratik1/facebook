"use client";

import Link from "next/link";
import styles from "./profile.module.css";

export default function ProfileError({ retry }: { retry: () => void }) {
  return (
    <main className={styles.page}>
      <div className={styles.empty} role="alert">
        <h1>We couldn’t load this profile</h1>
        <p>Please try again in a moment.</p>
        <div className={styles.actions}>
          <button className={styles.edit} onClick={() => retry()}>Try again</button>
          <Link href="/users">Back to people →</Link>
        </div>
      </div>
    </main>
  );
}
