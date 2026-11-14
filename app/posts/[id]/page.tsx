import { getComments } from "../../services/comments";
import CommentForm from "./components/comment-form";
import CommentList from "./components/comment-list";
import commentStyles from "./components/comments.module.css";
import Avatar from "../../components/avatar";
import { getCurrentUser } from "../../services/session";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getPostById } from "../../services/posts";
import LikeButton from "../../components/like-button";
import styles from "./post.module.css";

export default async function PostPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ page?: string | string[] }>;
}) {
  const { id } = await params;
  const postId = Number(id);

  if (!Number.isSafeInteger(postId) || postId <= 0 || postId > 2147483647) notFound();
  const user = await getCurrentUser();
  const post = await getPostById(postId, user?.id);
  if (!post) {
    notFound();
  }

  const query = await searchParams;
  const page = query.page === undefined ? 1 : typeof query.page === "string" ? Number(query.page) : NaN;
  if (!Number.isSafeInteger(page) || page < 1 || !Number.isSafeInteger((page - 1) * 10)) {
    redirect(`/posts/${postId}?page=1#comments`);
  }
  const commentData = await getComments({ postId, page });
  const lastPage = Math.max(1, commentData.pages);
  if (page > lastPage) redirect(`/posts/${postId}?page=${lastPage}#comments`);

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
      <section id="comments" className={commentStyles.section} aria-labelledby="comments-heading">
        <div className={commentStyles.heading}>
          <h2 id="comments-heading">Comments ({commentData.total})</h2>
          <span>Newest first</span>
        </div>
        {user ? <CommentForm postId={postId} page={page} /> : (
          <p className={commentStyles.login}><Link href="/login">Log in</Link> to join the conversation.</p>
        )}
        <CommentList data={commentData} postId={postId} />
      </section>
    </main>
  );
}
