import Link from "next/link";
import { notFound } from "next/navigation";
import { getPostById } from "../../services/stream";
import styles from "./post.module.css";

export default async function PostPage({ params }: PageProps<"/posts/[id]">) {
  const { id } = await params;
  const postId = Number(id);

  if (!Number.isSafeInteger(postId)) {
    notFound();
  }

  const post = getPostById(postId);

  if (!post) {
    notFound();
  }

  return (
    <main className={styles.page}>
      <nav className={styles.nav}>
        <Link href="/stream">Notes</Link>
      </nav>
      <article className={styles.note}>
        <Link href="/stream" className={styles.back}>
          ← All notes
        </Link>
        <header>
          <span className={styles.avatar} aria-hidden="true">
            {post.initials}
          </span>
          <div>
            <h1>{post.author}</h1>
            <p>{post.time}</p>
          </div>
        </header>
        <p className={styles.text}>{post.text}</p>
      </article>
    </main>
  );
}
