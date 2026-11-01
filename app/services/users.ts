import { eq } from "drizzle-orm";
import { db } from "../../db";
import { users } from "../../db/schema";

export const getUserProfile = async (id: string) => {
  return db.query.users.findFirst({
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
  return db.query.users.findFirst({
    where: eq(users.id, id),
    with: {
      posts: true,
    },
  });
};

export const getUsers = async () => {
  return db.query.users.findMany();
};

export const getUserWithPosts = async (id: string) => {
  return db.query.users.findFirst({
    where: eq(users.id, id),
    with: { posts: true },
  });
};
