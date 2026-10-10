import { eq, sql } from "drizzle-orm";
import { db } from "../../db";
import { posts, users, type Post } from "../../db/schema";

export const getPosts = async () => {
  return db.query.posts.findMany();
};

export const addPost = async (text: string, userId: number): Promise<Post> => {
  const content = text.trim();
  if (!content || content.length > 500) {
    throw new Error("Post text must contain between 1 and 500 characters.");
  }

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
  return db.query.posts.findFirst({ where: eq(posts.id, id) });
};

export const toggleLike = async (id: number) => {
  await db
    .update(posts)
    .set({ likes: sql`${posts.likes} + 1` })
    .where(eq(posts.id, id));
};

export const getPostsByUserId = async (userId: number) => {
  return db.query.posts.findMany({
    where: eq(posts.userId, userId),
  });
};
