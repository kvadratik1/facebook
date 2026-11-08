import { eq, sql } from "drizzle-orm";
import { db } from "../../db";
import { posts, users, type Post, type PostWithLike } from "../../db/schema";

function likedByUser(userId?: string) {
  return userId
    ? sql<boolean>`exists (select 1 from likes where likes.post_id = ${posts.id} and likes.user_id = ${userId}::uuid)`.as("liked_by_user")
    : sql<boolean>`false`.as("liked_by_user");
}

export const getPosts = async (userId?: string): Promise<PostWithLike[]> => {
  const result = await db.query.posts.findMany({
    with: { user: { columns: { name: true } } },
    extras: { likedByUser: likedByUser(userId) },
  });
  return result.map(withCurrentAuthor);
};

// Author names on existing posts follow profile edits too.
function withCurrentAuthor({ user, ...post }: PostWithLike & { user: { name: string } | null }): PostWithLike {
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

export const getPostById = async (id: number, userId?: string): Promise<PostWithLike | undefined> => {
  const post = await db.query.posts.findFirst({
    where: eq(posts.id, id),
    with: { user: { columns: { name: true } } },
    extras: { likedByUser: likedByUser(userId) },
  });
  return post ? withCurrentAuthor(post) : undefined;
};

// Each statement changes the relationship and counter atomically. Retries are no-ops.
export const setPostLike = async (id: number, userId: string, liked: boolean) => {
  const change = liked
    ? sql`insert into likes (post_id, user_id)
        select id, ${userId}::uuid from posts where id = ${id}
        on conflict (post_id, user_id) do nothing returning post_id`
    : sql`delete from likes where post_id = ${id} and user_id = ${userId}::uuid
        returning post_id`;
  const result = await db.execute<{ user_id: string }>(sql`
    with changed as (${change})
    update posts set likes = posts.likes + ${liked ? 1 : -1} * (select count(*)::int from changed)
    where posts.id = ${id}
    returning user_id
  `);
  return result.rows[0];
};

export const getPostsByUserId = async (userId: string) => {
  return db.query.posts.findMany({
    where: eq(posts.userId, userId),
  });
};
