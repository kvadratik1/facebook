"use client";

import { useCallback, useState } from "react";
import type { CommentBatch, CommentWithAuthor } from "../../../services/comments";
import CommentForm from "./comment-form";
import CommentList from "./comment-list";
import styles from "./comments.module.css";

export default function CommentSection({ postId, initialBatch, initialCount, signedInUser }: {
  postId: number;
  initialBatch: CommentBatch;
  initialCount: number;
  signedInUser: { name: string; avatarUrl: string | null; id: string } | null;
}) {
  const [count, setCount] = useState(initialCount);
  const [newComments, setNewComments] = useState<CommentWithAuthor[]>([]);
  const addComment = useCallback((comment: CommentWithAuthor) => {
    setNewComments(current => [{ ...comment, createdAt: new Date(comment.createdAt) }, ...current.filter(item => item.id !== comment.id)]);
    setCount(value => value + 1);
  }, []);

  return (
    <section id="comments" className={styles.section} aria-labelledby="comments-heading">
      <div className={styles.heading}>
        <h2 id="comments-heading">Comments ({count})</h2>
        <span>Newest first</span>
      </div>
      {signedInUser ? <CommentForm postId={postId} author={signedInUser} onCommentPosted={addComment} /> : (
        <p className={styles.login}><a href="/login">Log in</a> to join the conversation.</p>
      )}
      <CommentList initialBatch={initialBatch} newComments={newComments} postId={postId} />
    </section>
  );
}
