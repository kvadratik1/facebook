import { eq } from "drizzle-orm";
import { db } from "../../db";
import { posts } from "../../db/schema";

export const getPosts = async () => {
  return db.query.posts.findMany();
};

// export function addPost(text: string): Promise<Post> {
//   const newPost: Post = {
//     id: Date.now(),
//     author: "Alex Turner",
//     initials: "AT",
//     avatar: "avatarGreen",
//     time: "Just now",
//     text,
//     likes: 0,
//     comments: 0,
//     shares: 0,
//     media: null,
//   };

//   posts = [newPost, ...posts];
//   return { ...newPost };
// }

// export function getPostById(id: number): Post | undefined {
//   return posts.find((post) => post.id === id);
// }

// export function toggleLike(id: number) {
//   const post = posts.find((post) => post.id === id);
//   if (post) {
//     post.likes++;
//   }
// }
