import styles from "./profile.module.css";

export default function Loading() {
  return (
    <main className={styles.page} aria-busy="true" aria-label="Loading profile">
      <p role="status" className={styles.muted}>Loading profile…</p>
      <div className={styles.header} aria-hidden="true">
        <div className={styles.cover} />
        <div className={styles.details}>
          <div className={styles.identityRow}><div className={styles.avatar} /></div>
          <div className={styles.skeleton} /><div className={styles.skeleton} />
        </div>
      </div>
    </main>
  );
}
