"use client";

import Image from "next/image";
import { useActionState, useEffect, useRef, useState } from "react";
import { createPost } from "../../actions/posts";
import styles from "./create-post.module.css";
import { useNotification } from "../../components/NotificationContext";
import { postPhotoAccept, postPhotoHelp, validatePostPhoto } from "../post-photo";

export default function CreatePost() {
  const [text, setText] = useState("");
  const [photo, setPhoto] = useState<{ file: File; preview: string } | null>(null);
  const [photoError, setPhotoError] = useState("");
  const fileInput = useRef<HTMLInputElement>(null);
  const { showNotification } = useNotification();
  const [state, formAction, pending] = useActionState(
    async (previousState: { error: string; success: boolean }, formData: FormData) => {
      // React resets the file input after submission. Keep the selection for retries.
      if (photo) formData.set("photo", photo.file);
      const result = await createPost(previousState, formData);

      // Only celebrate and clear the draft after the server confirms the save.
      if (result.success) {
        showNotification("Post created!");
        setText("");
        setPhoto(null);
      }

      return result;
    },
    { error: "", success: false },
  );
  const preview = photo?.preview;
  useEffect(() => {
    if (preview) return () => URL.revokeObjectURL(preview);
  }, [preview]);
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
        <div className={styles.photoPicker}>
          <label htmlFor="post-photo">Add a photo</label>
          <input
            ref={fileInput}
            id="post-photo"
            type="file"
            accept={postPhotoAccept}
            aria-describedby="post-photo-help"
            disabled={pending}
            onChange={(event) => {
              const file = event.currentTarget.files?.[0];
              if (!file) return;
              const error = validatePostPhoto(file);
              setPhotoError(error);
              event.currentTarget.value = "";
              setPhoto(error ? null : { file, preview: URL.createObjectURL(file) });
            }}
          />
          <p id="post-photo-help">{postPhotoHelp}</p>
          {photo && (
            <div className={styles.attachment}>
              <div className={styles.preview}>
                <Image src={photo.preview} alt={`Preview of ${photo.file.name}`} fill unoptimized sizes="280px"
                  onError={() => {
                    setPhoto(null);
                    setPhotoError("This photo couldn’t be opened. Choose another photo.");
                  }} />
              </div>
              <button type="button" disabled={pending} onClick={() => {
                setPhoto(null);
                setPhotoError("");
                fileInput.current?.focus();
              }}>Remove photo</button>
            </div>
          )}
          {photoError && (
            <div className={styles.attachment}>
              <p className={styles.error} role="alert">{photoError}</p>
              <button type="button" onClick={() => setPhotoError("")}>Continue without a photo</button>
            </div>
          )}
        </div>
        <p className={styles.error} aria-live="polite">{state.error}</p>
        <div className={styles.controls}>
          <span>{length}/500</span>
          <button type="submit" disabled={pending || Boolean(photoError) || text.trim().length < 2}>
            {pending ? "Saving…" : "Share post"}
          </button>
        </div>
      </form>
    </section>
  );
}
