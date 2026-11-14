"use client";

import { useActionState, useState } from "react";
import { useRouter } from "next/navigation";
import { createComment } from "../../../actions/comments";
import styles from "./comments.module.css";

export default function CommentForm({ postId, page }: { postId: number; page: number }) {
  const [text, setText] = useState("");
  const router = useRouter();
  const [state, action, pending] = useActionState(
    async (previous: { error: string; success: boolean }, data: FormData) => {
      const result = await createComment(previous, data);
      if (result.success) {
        setText("");
        // Newest comments are on page one; the action already refreshes its data.
        if (page !== 1) router.replace(`/posts/${postId}?page=1#comments`);
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
