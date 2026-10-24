"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { toggleLike, addPost } from "../services/posts";
import { getCurrentUser } from "../services/session";

export const createPost = async (
  _prevState: { error: string },
  formData: FormData
) => {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const value = formData.get("text");

  if (typeof value !== "string") {
    return { error: "Please enter post text." };
  }

  const content = value.trim();
  if (content.length > 500 || content.length < 2) {
    return { error: "Post text must contain between 2 and 500 characters." };
  }

  if (/(nigger|faggot|hitler)/i.test(content)) {
    return { error: "Post contains a blocked word." };
  }

  await addPost(content, user.id);
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
