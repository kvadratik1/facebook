"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { setPostLike, addPost } from "../services/posts";
import { getCurrentUser } from "../services/session";

export const createPost = async (
  _prevState: { error: string; success: boolean },
  formData: FormData
) => {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const value = formData.get("text");

  if (typeof value !== "string") {
    return { error: "Please enter post text.", success: false };
  }

  const content = value.trim();
  if (content.length > 500 || content.length < 2) {
    return { error: "Post text must contain between 2 and 500 characters.", success: false };
  }

  if (/(nigger|faggot|hitler)/i.test(content)) {
    return { error: "Post contains a blocked word.", success: false };
  }

  await addPost(content, user.id);
  revalidatePath("/stream");
  return { error: "", success: true };
};

export const setLikeButton = async (_previous: { error: string }, formData: FormData) => {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const id = Number(formData.get("id"));
  const liked = formData.get("liked");
  if (!Number.isSafeInteger(id) || id <= 0 || id > 2147483647 || (liked !== "true" && liked !== "false")) {
    return { error: "Invalid like request." };
  }

  let post;
  try {
    post = await setPostLike(id, user.id, liked === "true");
  } catch {
    return { error: "Could not save your like. Please try again." };
  }
  if (!post) return { error: "This post no longer exists." };

  revalidatePath(`/posts/${id}`);
  revalidatePath("/stream");
  revalidatePath(`/users/${post.user_id}`);
  return { error: "" };
};
