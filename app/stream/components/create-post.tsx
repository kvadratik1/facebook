"use client";

import { useActionState, useState } from "react";
import { createPost } from "../../actions/posts";
import styles from "./create-post.module.css";
import { useNotification } from "../../components/NotificationContext";

export default function CreatePost() {
  const [text, setText] = useState("");
  const { showNotification } = useNotification();
  const [state, formAction, pending] = useActionState(
    async (previousState: { error: string; success: boolean }, formData: FormData) => {
      const result = await createPost(previousState, formData);

      // Only celebrate and clear the draft after the server confirms the save.
      if (result.success) {
        showNotification("Post created!");
        setText("");
      }

      return result;
    },
    { error: "", success: false },
  );
  const length = text.length;

  return (
    <section className={styles.composer} aria-labelledby="composer-title">
      <h2 id="composer-title">Add a post</h2>
      <form action={formAction} aria-busy={pending}>
        <textarea
          disabled={pending}
          value={text}
          onChange={(event) => setText(event.target.value)}
          name="text"
          placeholder="Write something worth remembering…"
          aria-label="Post text"
          maxLength={500}
          minLength={2}
          rows={4}
          required
        />
        <p aria-live="polite">{state.error}</p>
        <div className={styles.controls}>
          <span>{length}/500</span>
          <button type="submit" disabled={pending || text.trim().length < 2}>
            {pending ? "Saving…" : "Share post"}
          </button>
        </div>
      </form>
    </section>
  );
}
