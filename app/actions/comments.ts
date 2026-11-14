"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { addComment } from "../services/comments";
import { getPostById } from "../services/posts";
import { getCurrentUser } from "../services/session";

export async function createComment(
  _previousState: { error: string; success: boolean },
  formData: FormData,
) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const postIdValue = formData.get("postId");
  const postId = typeof postIdValue === "string" ? Number(postIdValue) : NaN;
  if (!Number.isSafeInteger(postId) || postId <= 0 || postId > 2147483647) {
    return { error: "Invalid post ID.", success: false };
  }

  const value = formData.get("text");
  if (typeof value !== "string") {
    return { error: "Please enter a comment.", success: false };
  }

  const text = value.trim();
  if (text.length < 1 || text.length > 1000) {
    return { error: "Comment must contain 1–1,000 characters.", success: false };
  }

  let post;
  try {
    post = await getPostById(postId);
    if (!post) {
      return { error: "This post no longer exists.", success: false };
    }

    // Identity comes from the session, never from submitted form fields.
    await addComment({ postId, userId: user.id, text });
  } catch {
    return { error: "Could not save your comment. Please try again.", success: false };
  }

  revalidatePath(`/posts/${postId}`);
  revalidatePath("/stream");
  revalidatePath(`/users/${post.userId}`);

  return { error: "", success: true };
}
