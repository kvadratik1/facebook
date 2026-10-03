"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { createPost } from "../../actions/posts";
import styles from "./create-post.module.css";

function SubmitButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();

  return (
    <button type="submit" disabled={disabled || pending}>
      {pending ? "Saving…" : "Share note"}
    </button>
  );
}

export default function CreatePost() {
  const [text, setText] = useState("");
  const length = text.length;

  return (
    <section className={styles.composer} aria-labelledby="composer-title">
      <h2 id="composer-title">Add a note</h2>
      <form action={createPost}>
        <textarea
          value={text}
          onChange={(event) => setText(event.target.value)}
          name="text"
          placeholder="Write something worth remembering…"
          aria-label="Note text"
          maxLength={500}
          rows={4}
          required
        />
        <div className={styles.controls}>
          <span>{length}/500</span>
          <SubmitButton disabled={!text.trim()} />
        </div>
      </form>
    </section>
  );
}
