import { eq } from "drizzle-orm";
import { db } from "../../db";
import { users } from "../../db/schema";

export const getUserById = async (id: number) => {
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

export const getUserWithPosts = async (id: number) => {
  return db.query.users.findFirst({
    where: eq(users.id, id),
    with: { posts: true },
  });
};
