import type { Metadata } from "next";
import { getCurrentUser } from "../services/session";
import Stream from "./stream";
import { getPosts } from "../services/posts";

export const metadata: Metadata = {
  title: "Recent posts",
  description: "Write and read posts in a simple shared space.",
};

export default async function StreamPage() {
  const user = await getCurrentUser();
  const posts = await getPosts(user?.id);
  return <Stream posts={posts} />;
}
