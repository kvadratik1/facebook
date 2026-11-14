import Link from "next/link";
import Avatar from "../../../components/avatar";
import type { CommentsPage } from "../../../services/comments";
import styles from "./comments.module.css";

export default function CommentList({ data, postId }: { data: CommentsPage; postId: number }) {
  const { comments, page, pages } = data;
  // Keep the navigation compact even when a post has hundreds of pages.
  const visiblePages = [...new Set([1, page - 1, page, page + 1, pages])]
    .filter(number => number >= 1 && number <= pages).sort((a, b) => a - b);
  const pageUrl = (number: number) => `/posts/${postId}?page=${number}#comments`;

  return (
    <>
      {comments.length === 0 ? <p className={styles.empty}>No comments yet. Start the conversation.</p> : (
        <ul className={styles.list}>
          {comments.map(comment => (
            <li key={comment.id} className={styles.comment}>
              <Avatar src={comment.authorAvatarUrl} name={comment.author} className={styles.avatar} />
              <div className={styles.content}>
                <div className={styles.meta}>
                  <Link href={`/users/${comment.userId}`}>{comment.author}</Link>
                  <time dateTime={comment.createdAt.toISOString()}>
                    {comment.createdAt.toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short", timeZone: "UTC" })} UTC
                  </time>
                </div>
                <p className={styles.text}>{comment.text}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
      {pages > 1 && (
        <nav className={styles.pagination} aria-label="Comment pages">
          {page > 1 && <Link href={pageUrl(page - 1)}>← Previous</Link>}
          {visiblePages.map((number, index) => (
            <span key={number}>
              {index > 0 && number - visiblePages[index - 1] > 1 && <span className={styles.gap}>…</span>}
              <Link href={pageUrl(number)} aria-label={`Page ${number}`} aria-current={number === page ? "page" : undefined}>{number}</Link>
            </span>
          ))}
          {page < pages && <Link href={pageUrl(page + 1)}>Next →</Link>}
        </nav>
      )}
    </>
  );
}
