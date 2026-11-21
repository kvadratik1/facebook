import type { UserProfile } from "@/app/services/users";
import ProfileFollow from "./profile-follow";
import ProfileImage from "./profile-image";
import ProfileEditor from "./profile-editor";
import styles from "../profile.module.css";

type ProfileHeaderProps = {
  profile: UserProfile;
  isOwner: boolean;
  followerCount: number;
  followingCount: number;
  isFollowing: boolean | null;
};

export default function ProfileHeader({ profile, isOwner, followerCount, followingCount, isFollowing }: ProfileHeaderProps) {
  return (
    <section className={styles.header} aria-labelledby="profile-name">
      <ProfileImage src={profile.coverImageUrl} name={profile.name} kind="cover" />
      <div className={styles.details}>
        <div className={styles.identityRow}>
          <ProfileImage src={profile.avatarUrl} name={profile.name} kind="avatar" />
        </div>
        {isOwner && <p className={styles.eyebrow}>Your profile</p>}
        <h1 id="profile-name">{profile.name}</h1>
        <p className={styles.username}>@{profile.username}</p>
        <p className={profile.bio ? styles.bio : styles.muted}>{profile.bio || "No bio yet."}</p>
        <ProfileFollow
          key={profile.id}
          userId={profile.id}
          followerCount={followerCount}
          followingCount={followingCount}
          isFollowing={isFollowing}
        />
        {isOwner && <ProfileEditor profile={profile} />}
      </div>
    </section>
  );
}
