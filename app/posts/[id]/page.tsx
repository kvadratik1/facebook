import Link from "next/link";
import { notFound } from "next/navigation";
import { getPostById } from "../../services/stream";
import styles from "./post.module.css";
import { toggleLikeButton } from "@/app/actions/posts";

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
        <Link href="/stream">Posts</Link>
      </nav>
      <article className={styles.post}>
        <Link href="/stream" className={styles.back}>
          ← All posts
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
      <form action={toggleLikeButton}>
        <input type="hidden" name="id" value={post.id} />
        <button type="submit">
          {post.likes ? "Mark as not important" : "Mark as important"}
        </button>
      </form>
    </main>
  );
}
