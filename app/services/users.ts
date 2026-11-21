import { eq } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { getDb } from "../../db";
import { follows, users } from "../../db/schema";

export const getUserProfile = async (id: string) => {
  return getDb().query.users.findFirst({
    where: eq(users.id, id),
    columns: {
      id: true,
      username: true,
      name: true,
      bio: true,
      avatarUrl: true,
      coverImageUrl: true,
    },
  });
};

export type UserProfile = NonNullable<Awaited<ReturnType<typeof getUserProfile>>>;

export const getUserFollowers = async (id: string) => {
  const follower = alias(users, "follower");
  const rows = await getDb()
    .select({
      follower: {
        id: follower.id,
        username: follower.username,
        name: follower.name,
        avatarUrl: follower.avatarUrl,
      },
    })
    .from(users)
    .leftJoin(follows, eq(follows.followingId, users.id))
    .leftJoin(follower, eq(follows.followerId, follower.id))
    .where(eq(users.id, id))
    .orderBy(follower.name, follower.id);

  if (rows.length === 0) {
    return null;
  }

  return rows.flatMap(({ follower }) => follower ? [follower] : []);
};

export const getUserById = async (id: string) => {
  return getDb().query.users.findFirst({
    where: eq(users.id, id),
    with: {
      posts: true,
    },
  });
};

export const getUsers = async () => {
  return getDb().query.users.findMany();
};

export const getUserWithPosts = async (id: string) => {
  return getDb().query.users.findFirst({
    where: eq(users.id, id),
    with: { posts: true },
  });
};
