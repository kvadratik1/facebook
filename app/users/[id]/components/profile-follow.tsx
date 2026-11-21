"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { useNotification } from "@/app/components/NotificationContext";
import styles from "../profile.module.css";

type ProfileFollowProps = {
  userId: string;
  followerCount: number;
  followingCount: number;
  isFollowing: boolean | null;
};

export default function ProfileFollow({ userId, followerCount, followingCount, isFollowing }: ProfileFollowProps) {
  const router = useRouter();
  const { showNotification } = useNotification();
  const [pending, startTransition] = useTransition();

  function toggleFollow() {
    startTransition(async () => {
      try {
        const response = await fetch(`/api/user/${userId}/follow`, { method: "POST" });
        if (!response.ok) {
          const result = await response.json().catch(() => null);
          showNotification(result?.error || "Could not update your follow. Try again.", "error");
          return;
        }

        startTransition(() => router.refresh());
      } catch {
        showNotification("Could not update your follow. Try again.", "error");
      }
    });
  }

  return (
    <div className={styles.followRow}>
      <div className={styles.followCounts} aria-live="polite">
        <span><strong>{followerCount}</strong> {followerCount === 1 ? "follower" : "followers"}</span>
        <span><strong>{followingCount}</strong> following</span>
      </div>
      {isFollowing !== null && (
        <button
          className={isFollowing ? styles.edit : styles.save}
          type="button"
          onClick={toggleFollow}
          disabled={pending}
          title={isFollowing ? "Unfollow" : undefined}
          aria-label={isFollowing && !pending ? "Following, click to unfollow" : undefined}
        >
          {pending ? "Updating…" : isFollowing ? "Following" : "Follow"}
        </button>
      )}
    </div>
  );
}
