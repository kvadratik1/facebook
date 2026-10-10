import Link from "next/link";
import { notFound } from "next/navigation";
import { getUserById } from "../../services/users";

export default async function UserPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getUserById(Number(id));

  if (!user) {
    notFound();
  }

  return (
    <div>
      <h2>{user.name}</h2>
      <p>Username: {user.username}</p>
      <h3>Posts</h3>
      <ul>
        {user.posts.map((post) => (
          <li key={post.id}>
            <Link href={`/posts/${post.id}`}>{post.text}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
