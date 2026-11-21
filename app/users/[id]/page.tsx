import Link from "next/link";
import { notFound } from "next/navigation";
import { getUserFollowCounts, getUserProfile, isUserFollowing } from "../../services/users";
import { getPostsByUserId } from "../../services/posts";
import { getCurrentUser } from "../../services/session";
import ProfileHeader from "./components/profile-header";
import ProfilePosts from "./components/profile-posts";
import styles from "./profile.module.css";

export default async function UserPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
    notFound();
  }
  const [user, viewer, counts] = await Promise.all([
    getUserProfile(id),
    getCurrentUser(),
    getUserFollowCounts(id),
  ]);

  if (!user || !counts) {
    notFound();
  }

  const isOwner = viewer?.id === user.id;
  const [posts, isFollowing] = await Promise.all([
    getPostsByUserId(user.id),
    viewer && !isOwner ? isUserFollowing(viewer.id, user.id) : null,
  ]);

  return (
    <main className={styles.page}>
      <Link href="/users" className={styles.back}>← Back to people</Link>
      <ProfileHeader profile={user} isOwner={isOwner} {...counts} isFollowing={isFollowing} />
      <ProfilePosts posts={posts} isOwner={isOwner} />
    </main>
  );
}
