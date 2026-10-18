"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { toggleLike, addPost } from "../services/posts";
import { getCurrentUser } from "../services/session";

export const createPost = async (formData: FormData) => {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const value = formData.get("text");

  if (typeof value !== "string" || !value.trim()) {
    return;
  }

  await addPost(value.trim().slice(0, 500), user.id);
  revalidatePath("/stream");
  redirect("/stream");
};

export const toggleLikeButton = async (formData: FormData) => {
  const id = Number(formData.get("id"));

  if (!Number.isSafeInteger(id) || id <= 0 || id > 2147483647) {
    return;
  }

  await toggleLike(id);
  revalidatePath(`/posts/${id}`);
  revalidatePath("/stream");
};
