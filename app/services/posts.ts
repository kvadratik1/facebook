import { eq, sql } from "drizzle-orm";
import { db } from "../../db";
import { posts, users, type Post } from "../../db/schema";

export const getPosts = async () => {
  const result = await db.query.posts.findMany({
    with: { user: { columns: { name: true } } },
  });
  return result.map(withCurrentAuthor);
};

// Author names on existing posts follow profile edits too.
function withCurrentAuthor({ user, ...post }: Post & { user: { name: string } | null }): Post {
  if (!user) return post;
  return {
    ...post,
    author: user.name,
    initials: user.name.trim().split(/\s+/).slice(0, 2).map(part => part[0]).join("").toUpperCase(),
  };
}

export const addPost = async (text: string, userId: string): Promise<Post> => {
  const content = text.trim();

  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
  });
  if (!user) {
    throw new Error("User not found.");
  }

  const [post] = await db
    .insert(posts)
    .values({
      text: content,
      userId: user.id,
      author: user.name,
      initials: user.name
        .trim()
        .split(/\s+/)
        .map((part) => part[0])
        .slice(0, 2)
        .join("")
        .toUpperCase(),
      avatar: "avatarGreen",
      time: new Date().toISOString(),
    })
    .returning();

  return post;
};

export const getPostById = async (id: number): Promise<Post | undefined> => {
  const post = await db.query.posts.findFirst({
    where: eq(posts.id, id),
    with: { user: { columns: { name: true } } },
  });
  return post ? withCurrentAuthor(post) : undefined;
};

export const toggleLike = async (id: number) => {
  await db
    .update(posts)
    .set({ likes: sql`${posts.likes} + 1` })
    .where(eq(posts.id, id));
};

export const getPostsByUserId = async (userId: string) => {
  return db.query.posts.findMany({
    where: eq(posts.userId, userId),
  });
};
