import Link from "next/link";
import styles from "./profile.module.css";

export default function NotFound() {
  return (
    <main className={styles.page}>
      <div className={styles.empty}>
        <h1>Profile not found</h1>
        <p>This profile doesn’t exist or is no longer available.</p>
        <Link href="/users">Back to people →</Link>
      </div>
    </main>
  );
}
