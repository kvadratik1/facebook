"use server";

import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { db } from "../../db";
import { users } from "../../db/schema";

export const registerUser = async (
  _previousState: { message: string },
  formData: FormData,
) => {
  const usernameValue = formData.get("username");
  const nameValue = formData.get("name");
  const password = formData.get("password");

  if (
    typeof usernameValue !== "string" || !usernameValue.trim() ||
    typeof nameValue !== "string" || !nameValue.trim() ||
    typeof password !== "string" || !password
  ) {
    return { message: "Please enter a username, name, and password." };
  }

  const username = usernameValue.trim();
  const name = nameValue.trim();

  const passwordHash = await bcrypt.hash(password, 10);

  const [user] = await db.insert(users)
    .values({ username, name, passwordHash })
    .onConflictDoNothing({ target: users.username })
    .returning({ id: users.id });

  if (!user) {
    return { message: "That username is already taken. Please choose another." };
  }

  redirect("/login");
};
