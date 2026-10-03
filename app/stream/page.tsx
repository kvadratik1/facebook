import type { Metadata } from "next";
import Stream from "./stream";
import { getPosts } from "../services/stream";

export const metadata: Metadata = {
  title: "Recent posts",
  description: "Write and read posts in a simple shared space.",
};

export default async function StreamPage() {
  const posts = await getPosts();
  return <Stream posts={posts} />;
}
