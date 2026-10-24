"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import styles from "./navbar.module.css";

export default function NavBar() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const name = session?.user?.name || session?.user?.email || "Your account";
  const initials = name.split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase();

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link href="/" className={styles.brand}>Posts<span>A simple shared space</span></Link>
        <nav className={styles.nav} aria-label="Main navigation">
          <Link href="/stream" aria-current={pathname === "/stream" ? "page" : undefined}>Stream</Link>
          <Link href="/users" aria-current={pathname.startsWith("/users") ? "page" : undefined}>People</Link>
        </nav>
        <div className={styles.account}>
          {status === "loading" ? <span className={styles.loading}>Loading account…</span> : session ? (
            <>
              <span className={styles.avatar} aria-hidden="true">{initials}</span>
              <div className={styles.identity}><span>Signed in as</span><strong>{name}</strong>{session.user?.email && <small>@{session.user.email}</small>}</div>
              <button className={styles.signOut} onClick={() => signOut({ callbackUrl: "/login" })}>Log out</button>
            </>
          ) : (
            <>
              <Link href="/login" className={styles.login} aria-current={pathname === "/login" ? "page" : undefined}>Log in</Link>
              <Link href="/register" className={styles.join}>Join the conversation <span aria-hidden="true">↗</span></Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
