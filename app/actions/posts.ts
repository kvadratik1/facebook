"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { addPost } from "../services/stream";
import { toggleLike } from "../services/stream";

export const createPost = async (formData: FormData) => {
  const value = formData.get("text");

  if (typeof value !== "string" || !value.trim()) {
    return;
  }

  await addPost(value.trim().slice(0, 500));
  revalidatePath("/stream");
  redirect("/stream");
};

export const toggleLikeButton = async (formData: FormData) => {
  const id = Number(formData.get("id"));

  if (!Number.isSafeInteger(id)) {
    return;
  }

  toggleLike(id);
  revalidatePath(`/posts/${id}`);
  revalidatePath("/stream");
};
