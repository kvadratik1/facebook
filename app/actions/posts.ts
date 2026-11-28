"use server";

import { randomUUID } from "node:crypto";
import { del, put } from "@vercel/blob";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import sharp from "sharp";
import { setPostLike, addPost, getPostByPhotoKey } from "../services/posts";
import { getCurrentUser } from "../services/session";
import { validatePostPhoto } from "../stream/post-photo";

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

  const attachments = formData.getAll("photo");
  const photo = attachments[0];
  if (attachments.length > 1 || (photo !== undefined && !(photo instanceof File))) {
    return { error: "Choose one photo per post.", success: false };
  }

  let photoKey: string | undefined;
  if (photo) {
    const error = validatePostPhoto(photo);
    if (error) return { error, success: false };

    let image: Buffer;
    try {
      const source = sharp(Buffer.from(await photo.arrayBuffer()), { limitInputPixels: 40_000_000 });
      const { format } = await source.metadata();
      if (format !== "jpeg" && format !== "png" && format !== "webp") {
        return { error: "Choose a JPEG, PNG, or WebP photo.", success: false };
      }
      image = await source
        .autoOrient()
        .resize({ width: 2000, height: 2000, fit: "inside", withoutEnlargement: true })
        .webp()
        .toBuffer();
    } catch {
      return { error: "This photo couldn’t be processed. Choose another photo.", success: false };
    }

    try {
      const uploaded = await put(`post-photos/${randomUUID()}.webp`, image, {
        access: "public",
        contentType: "image/webp",
      });
      photoKey = uploaded.pathname;
    } catch {
      return { error: "Could not upload your photo. Please try again.", success: false };
    }
  }

  try {
    await addPost(content, user.id, photoKey);
  } catch {
    if (!photoKey) return { error: "Could not save your post. Please try again.", success: false };
    let savedPost;
    try {
      // A lost database response can mean the insert succeeded. Check before deleting its photo.
      savedPost = await getPostByPhotoKey(photoKey);
    } catch {
      return { error: "Could not confirm that your post was saved. Check the feed before retrying.", success: false };
    }
    if (!savedPost) {
      await del(photoKey).catch(() => console.error("Could not remove unused post photo:", photoKey));
      return { error: "Could not save your post. Please try again.", success: false };
    }
  }
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
