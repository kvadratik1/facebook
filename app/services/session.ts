import { auth } from "@/app/auth";
import { eq } from "drizzle-orm";
import { getDb } from "../../db";
import { users } from "../../db/schema";

export const getCurrentUser = async () => {
  const session = await auth();
  if (!session?.user?.email) {
    return null;
  }

  return getDb().query.users.findFirst({
    where: eq(users.username, session.user.email),
  });
};
