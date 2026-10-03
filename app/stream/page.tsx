import type { Metadata } from "next";
import Stream from "./stream";
import { getPosts } from "../services/stream";

export const metadata: Metadata = {
  title: "Recent notes",
  description: "Write and read notes in a simple shared space.",
};

export default async function StreamPage() {
  const posts = await getPosts();
  return <Stream posts={posts} />;
}
