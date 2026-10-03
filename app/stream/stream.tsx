import Link from "next/link";
import { type Post } from "../services/stream";
import CreatePost from "./components/create-post";
import styles from "./stream.module.css";

function PostMedia({ type }: { type: NonNullable<Post["media"]> }) {
  return (
    <div className={`${styles.media} ${styles[type]}`} aria-hidden="true">
      <span>{type === "travel" ? "Coastline study" : "Weekly prompt"}</span>
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

      <Link className={styles.postLink} href={`/posts/${post.id}`}>
        Open note <span aria-hidden="true">→</span>
      </Link>
    </article>
  );
}

export default function Stream({ posts }: { posts: Post[] }) {
  return (
    <div className={styles.page}>
      <header className={styles.siteHeader}>
        <Link href="/stream" className={styles.brand}>
          Notes
        </Link>
        <span>A small shared notebook</span>
      </header>

      <main className={styles.main}>
        <section className={styles.intro}>
          <p className={styles.eyebrow}>Shared thoughts</p>
          <h1>What’s on your mind?</h1>
          <p>Write something down, or take a quiet look through recent notes.</p>
        </section>

        <CreatePost />

        <section className={styles.posts} aria-label="Recent notes">
          <div className={styles.sectionHeading}>
            <h2>Recent notes</h2>
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
