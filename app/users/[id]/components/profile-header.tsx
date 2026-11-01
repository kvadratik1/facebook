import type { UserProfile } from "@/app/services/users";
import ProfileImage from "./profile-image";
import styles from "../profile.module.css";

export default function ProfileHeader({ profile, isOwner }: { profile: UserProfile; isOwner: boolean }) {
  return (
    <section className={styles.header} aria-labelledby="profile-name">
      <ProfileImage src={profile.coverImageUrl} name={profile.name} kind="cover" />
      <div className={styles.details}>
        <div className={styles.identityRow}>
          <ProfileImage src={profile.avatarUrl} name={profile.name} kind="avatar" />
          {isOwner && <button className={styles.edit} disabled title="Profile editing is not available yet">Edit profile</button>}
        </div>
        {isOwner && <p className={styles.eyebrow}>Your profile</p>}
        <h1 id="profile-name">{profile.name}</h1>
        <p className={styles.username}>@{profile.username}</p>
        <p className={profile.bio ? styles.bio : styles.muted}>{profile.bio || "No bio yet."}</p>
      </div>
    </section>
  );
}
