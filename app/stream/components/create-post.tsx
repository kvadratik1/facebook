"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { createPost } from "../../actions/posts";
import styles from "./create-post.module.css";

function SubmitButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();

  return (
    <button type="submit" disabled={disabled || pending}>
      {pending ? "Saving…" : "Share post"}
    </button>
  );
}

export default function CreatePost() {
  const [state, formAction] = useActionState(createPost, { error: "" });
  const [text, setText] = useState("");
  const length = text.length;

  return (
    <section className={styles.composer} aria-labelledby="composer-title">
      <h2 id="composer-title">Add a post</h2>
      <form action={formAction}>
        <textarea
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
          <SubmitButton disabled={text.trim().length < 2} />
        </div>
      </form>
    </section>
  );
}
