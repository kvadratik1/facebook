import Link from "next/link";
import { notFound } from "next/navigation";
import { getUserProfile } from "../../services/users";
import { getPostsByUserId } from "../../services/posts";
import { auth } from "../../auth";
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
  const user = await getUserProfile(id);

  if (!user) {
    notFound();
  }

  const [posts, session] = await Promise.all([getPostsByUserId(user.id), auth()]);
  const isOwner = session?.user?.email === user.username;

  return (
    <main className={styles.page}>
      <Link href="/users" className={styles.back}>← Back to people</Link>
      <ProfileHeader profile={user} isOwner={isOwner} />
      <ProfilePosts posts={posts} isOwner={isOwner} />
    </main>
  );
}
