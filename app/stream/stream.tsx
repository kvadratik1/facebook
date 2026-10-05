import Link from "next/link";
// import LikeButton from "../components/like-button";
import { type Post } from "../services/stream";
import CreatePost from "./components/create-post";
import styles from "./stream.module.css";

function PostMedia({ type }: { type: NonNullable<Post["media"]> }) {
  const mediaStyle =
    type === "travel"
      ? styles.travel
      : type === "design"
      ? styles.design
      : styles.genericMedia;

  return (
    <div className={`${styles.media} ${mediaStyle}`} aria-hidden="true">
      <span>
        {type === "travel"
          ? "Coastline study"
          : type === "design"
          ? "Weekly prompt"
          : type}
      </span>
    </div>
  );
}

function FeedPost({ post }: { post: Post }) {
  return (
    <article className={styles.post}>
      <header className={styles.postHeader}>
        <span className={styles.avatar} aria-hidden="true">
          {post.initials}
        </span>
        <div>
          <h2>{post.author}</h2>
          <p>{post.time}</p>
        </div>
      </header>

      <p className={styles.postText}>{post.text}</p>
      {post.media && <PostMedia type={post.media} />}

      <footer className={styles.postFooter}>
        {/* <LikeButton postId={post.id} likes={post.likes} author={post.author} /> */}
        <Link className={styles.postLink} href={`/posts/${post.id}`}>
          Open post <span aria-hidden="true">→</span>
        </Link>
      </footer>
    </article>
  );
}

export default function Stream({ posts }: { posts: Post[] }) {
  return (
    <div className={styles.page}>
      <header className={styles.siteHeader}>
        <Link href="/stream" className={styles.brand}>
          Posts
        </Link>
        <span>A simple shared space</span>
      </header>

      <main className={styles.main}>
        <section className={styles.intro}>
          <p className={styles.eyebrow}>Shared thoughts</p>
          <h1>What’s on your mind?</h1>
          <p>
            Write something down, or take a quiet look through recent posts.
          </p>
        </section>

        <CreatePost />

        <section className={styles.posts} aria-label="Recent posts">
          <div className={styles.sectionHeading}>
            <h2>Recent posts</h2>
            <span>{posts.length}</span>
          </div>
          {posts.map((post) => (
            <FeedPost post={post} key={post.id} />
          ))}
        </section>
      </main>

      <footer className={styles.footer}>Made for simple thoughts.</footer>
    </div>
  );
}
