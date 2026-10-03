"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { addPost } from "../services/stream";

export const createPost = async (formData: FormData) => {
  const value = formData.get("text");

  if (typeof value !== "string" || !value.trim()) {
    return;
  }

  await addPost(value.trim().slice(0, 500));
  revalidatePath("/stream");
  redirect("/stream");
};
