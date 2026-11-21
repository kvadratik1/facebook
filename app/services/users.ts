import { eq } from "drizzle-orm";
import { getDb } from "../../db";
import { users } from "../../db/schema";

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
