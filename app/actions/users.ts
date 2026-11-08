"use server";

import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { db } from "../../db";
import { users } from "../../db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "../services/session";

export async function updateProfile(
  _previousState: { error: string; success: boolean },
  formData: FormData,
) {
  const user = await getCurrentUser();
  if (!user) return { error: "Please sign in to edit your profile.", success: false };

  const name = formData.get("name");
  const bio = formData.get("bio");
  if (typeof name !== "string" || !name.trim() || name.trim().length > 80) {
    return { error: "Your name must contain between 1 and 80 characters.", success: false };
  }
  if (typeof bio !== "string" || bio.trim().length > 160) {
    return { error: "Your bio must be 160 characters or fewer.", success: false };
  }

  const photo = formData.get("photo");
  const removePhoto = formData.get("removePhoto") === "true";
  let avatarUrl: string | null | undefined = removePhoto ? null : undefined;
  if (photo instanceof File && photo.size > 0 && !removePhoto) {
    if (photo.size > 512 * 1024) {
      return { error: "Choose a photo smaller than 512 KB.", success: false };
    }
    const bytes = Buffer.from(await photo.arrayBuffer());
    // Determine the type from the bytes, not the supplied filename or MIME type.
    const mime = bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))
      ? "image/png"
      : bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255
        ? "image/jpeg"
        : bytes.toString("ascii", 0, 4) === "RIFF" && bytes.toString("ascii", 8, 12) === "WEBP"
          ? "image/webp" : null;
    if (!mime) return { error: "Choose a PNG, JPEG, or WebP photo.", success: false };
    avatarUrl = `data:${mime};base64,${bytes.toString("base64")}`;
  }

  try {
    // The target always comes from the session, never a submitted user ID.
    const [saved] = await db.update(users).set({
      name: name.trim(),
      bio: bio.trim() || null,
      ...(avatarUrl !== undefined ? { avatarUrl, avatarPublicId: null } : {}),
    }).where(eq(users.id, user.id)).returning({ id: users.id });
    if (!saved) return { error: "Your account could not be found.", success: false };
  } catch {
    return { error: "Your profile could not be saved. Please try again.", success: false };
  }

  revalidatePath(`/users/${user.id}`);
  revalidatePath("/users");
  revalidatePath("/stream");
  revalidatePath("/posts/[id]", "page");
  return { error: "", success: true };
}

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
