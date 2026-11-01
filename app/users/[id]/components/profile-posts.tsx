import Link from "next/link";
import type { Post } from "@/db/schema";
import styles from "../profile.module.css";

export default function ProfilePosts({ posts, isOwner }: { posts: Post[]; isOwner: boolean }) {
  return (
    <section className={styles.posts} aria-labelledby="profile-posts">
      <div className={styles.sectionHeading}><h2 id="profile-posts">Posts</h2><span>{posts.length}</span></div>
      {posts.length ? (
        <ul className={styles.postList}>
          {posts.map(post => (
            <li key={post.id} className={styles.post}>
              <article>
                <p className={styles.postText}>{post.text}</p>
                <div className={styles.postFooter}>
                  <span>{post.likes} likes · {post.comments} comments</span>
                  <Link href={`/posts/${post.id}`}>View post →</Link>
                </div>
              </article>
            </li>
          ))}
        </ul>
      ) : (
        <div className={styles.empty}>
          <h3>No posts yet</h3>
          <p>{isOwner ? "Share a thought to start your story." : "When they share something, it will appear here."}</p>
          {isOwner && <Link href="/stream">Write your first post →</Link>}
        </div>
      )}
    </section>
  );
}
