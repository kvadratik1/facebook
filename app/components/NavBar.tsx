"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";

export default function NavBar() {
  const { data: session } = useSession();

  return (
    <nav>
      <Link href="/">home</Link>
      {" | "}
      <Link href="/stream">stream</Link>
      {" | "}
      <Link href="/users">users</Link>
      {" | "}
      {session ? (
        <>
          <Link href="/posts/new">create new</Link>
          {" | "}
          <em>{session.user?.name} logged in</em>{" "}
          <button onClick={() => signOut()}>logout</button>
        </>
      ) : (
        <div>
          <Link href="/login">login</Link>
          {" | "}
          <Link href="/register">register</Link>
        </div>
      )}
    </nav>
  );
}
