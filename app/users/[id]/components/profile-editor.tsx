"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { updateProfile } from "@/app/actions/users";
import { useNotification } from "@/app/components/NotificationContext";
import type { UserProfile } from "@/app/services/users";
import ProfileImage from "./profile-image";
import styles from "../profile.module.css";

export default function ProfileEditor({ profile }: { profile: UserProfile }) {
  const [open, setOpen] = useState(false);
  const button = useRef<HTMLButtonElement>(null);
  function close() {
    setOpen(false);
    button.current?.focus();
  }
  return (
    <div className={styles.editor}>
      <button ref={button} className={styles.edit} onClick={() => setOpen(true)} aria-expanded={open} aria-controls="profile-editor">Edit profile</button>
      {open && <ProfileForm profile={profile} onClose={close} />}
    </div>
  );
}

function ProfileForm({ profile, onClose }: { profile: UserProfile; onClose: () => void }) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [state, action, pending] = useActionState(async (previous: { error: string; success: boolean }, data: FormData) => {
    // Keep the selected photo available when React resets the file input after an error.
    if (selectedFile) data.set("photo", selectedFile);
    return updateProfile(previous, data);
  }, { error: "", success: false });
  const [name, setName] = useState(profile.name);
  const [bio, setBio] = useState(profile.bio || "");
  const [preview, setPreview] = useState<string | null>(null);
  const [removePhoto, setRemovePhoto] = useState(false);
  const [photoError, setPhotoError] = useState("");
  const fileInput = useRef<HTMLInputElement>(null);
  const nameInput = useRef<HTMLInputElement>(null);
  const { showNotification } = useNotification();
  const { update } = useSession();

  useEffect(() => { nameInput.current?.focus(); }, []);
  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview); }, [preview]);
  useEffect(() => {
    if (state.success) {
      showNotification("Profile updated.");
      void update();
      onClose();
    }
  }, [state.success, showNotification, update, onClose]);

  return (
    <form id="profile-editor" className={styles.editorForm} action={action} aria-label="Edit profile">
      <h2>Edit profile</h2>
      <fieldset disabled={pending}>
        <label htmlFor="profile-name-input">Name</label>
        <input ref={nameInput} id="profile-name-input" name="name" value={name} onChange={event => setName(event.target.value)} required maxLength={80} autoComplete="name" />
        <label htmlFor="profile-bio">Bio</label>
        <textarea id="profile-bio" name="bio" value={bio} onChange={event => setBio(event.target.value)} maxLength={160} rows={3} aria-describedby="bio-count" />
        <p id="bio-count" className={styles.muted}>{bio.length}/160 characters</p>
        <label htmlFor="profile-photo">Profile picture</label>
        <ProfileImage src={removePhoto ? null : preview || profile.avatarUrl} name={name} kind="avatar" />
        <input ref={fileInput} id="profile-photo" name="photo" type="file" accept="image/png,image/jpeg,image/webp" aria-describedby="photo-help" onChange={event => {
          const file = event.target.files?.[0];
          setPreview(null);
          setSelectedFile(null);
          setPhotoError("");
          if (!file) return;
          if (file.size > 512 * 1024 || !["image/png", "image/jpeg", "image/webp"].includes(file.type)) {
            setPhotoError("Choose a PNG, JPEG, or WebP photo up to 512 KB.");
            event.target.value = "";
            return;
          }
          setRemovePhoto(false);
          setSelectedFile(file);
          setPreview(URL.createObjectURL(file));
        }} />
        <p id="photo-help" className={styles.muted}>PNG, JPEG, or WebP, up to 512 KB. Your photo is cropped to a circle.</p>
        <input type="hidden" name="removePhoto" value={String(removePhoto)} />
        {(preview || profile.avatarUrl) && !removePhoto && <button type="button" className={styles.edit} onClick={() => {
          setRemovePhoto(true);
          setSelectedFile(null);
          setPreview(null);
          setPhotoError("");
          if (fileInput.current) fileInput.current.value = "";
        }}>Remove photo</button>}
        {(photoError || state.error) && <p className={styles.formError} role="alert">{photoError || state.error}</p>}
        <div className={styles.editorActions}>
          <button className={styles.save} type="submit" disabled={Boolean(photoError)}>{pending ? "Saving…" : "Save changes"}</button>
          <button className={styles.edit} type="button" onClick={onClose}>Cancel</button>
        </div>
      </fieldset>
    </form>
  );
}
