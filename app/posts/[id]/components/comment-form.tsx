"use client";

import { useActionState, useState } from "react";
import { createComment } from "../../../actions/comments";
import type { CommentWithAuthor } from "../../../services/comments";
import styles from "./comments.module.css";

export default function CommentForm({ postId, author, onCommentPosted }: {
  postId: number;
  author: { id: string; name: string; avatarUrl: string | null };
  onCommentPosted: (comment: CommentWithAuthor) => void;
}) {
  const [text, setText] = useState("");
  const [state, action, pending] = useActionState(
    async (previous: { error: string; success: boolean }, data: FormData) => {
      const result = await createComment(previous, data);
      if (result.success) {
        setText("");
        if (result.comment) onCommentPosted({
          ...result.comment,
          createdAt: new Date(result.comment.createdAt),
          author: author.name,
          authorAvatarUrl: author.avatarUrl,
        });
      }
      return result;
    },
    { error: "", success: false },
  );

  return (
    <form action={action} className={styles.form} aria-busy={pending}>
      <input type="hidden" name="postId" value={postId} />
      <label htmlFor="comment-text">Add a comment</label>
      <textarea id="comment-text" name="text" rows={3} required maxLength={1000}
        value={text} onChange={event => setText(event.target.value)} disabled={pending}
        placeholder="Join the conversation…" aria-describedby="comment-count comment-status" />
      <div className={styles.controls}>
        <span id="comment-count">{text.length}/1,000 characters</span>
        <button type="submit" disabled={pending || !text.trim()}>
          {pending ? "Posting…" : "Post comment"}
        </button>
      </div>
      <p id="comment-status" role="status" className={state.error ? styles.error : styles.status}>
        {pending ? "" : state.error || (state.success ? "Comment posted." : "")}
      </p>
    </form>
  );
}
