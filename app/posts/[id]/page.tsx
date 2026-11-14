import Avatar from "../../components/avatar";
import { getCurrentUser } from "../../services/session";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPostById } from "../../services/posts";
import LikeButton from "../../components/like-button";
import styles from "./post.module.css";

export default async function PostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const postId = Number(id);

  if (!Number.isSafeInteger(postId) || postId <= 0 || postId > 2147483647) notFound();
  const user = await getCurrentUser();
  const post = await getPostById(postId, user?.id);
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
          <Avatar src={post.authorAvatarUrl} name={post.author} className={styles.avatar} />
          <div>
            <h1>
              <Link href={`/users/${post.userId}`}>{post.author}</Link>
            </h1>
            <p>{post.time}</p>
          </div>
        </header>
        <p className={styles.text}>{post.text}</p>
        <div className={styles.actions}>
          <LikeButton
            postId={post.id}
            likes={post.likes}
            likedByUser={post.likedByUser}
            author={post.author}
          />
        </div>
      </article>
    </main>
  );
}
