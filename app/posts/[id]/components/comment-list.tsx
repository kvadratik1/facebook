"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import Avatar from "../../../components/avatar";
import type { CommentBatch, CommentWithAuthor } from "../../../services/comments";
import styles from "./comments.module.css";

function uniqueComments(comments: CommentWithAuthor[]) {
  return [...new Map(comments.map(comment => [comment.id, comment])).values()];
}

export default function CommentList({ initialBatch, newComments, postId }: {
  initialBatch: CommentBatch;
  newComments: CommentWithAuthor[];
  postId: number;
}) {
  const [loadedComments, setComments] = useState(initialBatch.comments);
  const comments = uniqueComments([...newComments, ...loadedComments]);
  const [cursor, setCursor] = useState(initialBatch.nextCursor);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const sentinel = useRef<HTMLDivElement>(null);
  const inFlight = useRef(false);

  const loadMore = useCallback(async () => {
    if (!cursor || inFlight.current) return;
    inFlight.current = true;
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`/api/posts/${postId}/comments?cursor=${encodeURIComponent(cursor)}`);
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not load comments.");
      const batch = result as CommentBatch;
      setComments(current => uniqueComments([...current, ...batch.comments]));
      setCursor(batch.nextCursor);
    } catch {
      setError("Could not load more comments.");
    } finally {
      inFlight.current = false;
      setLoading(false);
    }
  }, [cursor, postId]);

  useEffect(() => {
    if (!sentinel.current || !cursor) return;
    const observer = new IntersectionObserver(entries => {
      if (entries[0]?.isIntersecting) void loadMore();
    }, { rootMargin: "200px" });
    observer.observe(sentinel.current);
    return () => observer.disconnect();
  }, [cursor, loadMore]);

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
      {cursor && <div ref={sentinel} className={styles.sentinel} aria-hidden="true" />}
      {cursor && <button className={styles.loadMore} type="button" onClick={() => void loadMore()} disabled={loading}>
        {loading ? "Loading more…" : error ? "Retry loading comments" : "Load more comments"}
      </button>}
      {error && <p className={styles.error} role="alert">{error}</p>}
    </>
  );
}
