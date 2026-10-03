export type Post = {
  id: number;
  author: string;
  initials: string;
  avatar: string;
  time: string;
  text: string;
  likes: number;
  comments: number;
  shares: number;
  media?: "travel" | "design";
};

const seedPosts: Post[] = [
  {
    id: 1,
    author: "Maya Chen",
    initials: "MC",
    avatar: "avatarCoral",
    time: "2 hr",
    text: "Finally made it to the coast. Nothing clears the head like salty air and an empty calendar. 🌊",
    likes: 428,
    comments: 36,
    shares: 8,
    media: "travel",
  },
  {
    id: 2,
    author: "The Design Club",
    initials: "DC",
    avatar: "avatarViolet",
    time: "4 hr",
    text: "This week’s creative prompt: redesign something you use every day. Keep it simple, thoughtful, and share your process—not just the polish.",
    likes: 184,
    comments: 24,
    shares: 11,
    media: "design",
  },
  {
    id: 3,
    author: "Noah Williams",
    initials: "NW",
    avatar: "avatarBlue",
    time: "Yesterday",
    text: "Small win: shipped the side project I’ve been quietly working on for the last six weekends. It isn’t perfect, but it’s out in the world. 🚀",
    likes: 97,
    comments: 18,
    shares: 2,
  },
];

let posts = [...seedPosts];

const wait = (milliseconds: number) =>
  new Promise((resolve) => setTimeout(resolve, milliseconds));

/** Simulates GET /posts. */
export async function getPosts(): Promise<Post[]> {
  await wait(350);
  return posts.map((post) => ({ ...post }));
}

/** Simulates POST /posts. */
export async function addPost(text: string): Promise<Post> {
  await wait(250);

  const newPost: Post = {
    id: Date.now(),
    author: "Alex Turner",
    initials: "AT",
    avatar: "avatarGreen",
    time: "Just now",
    text,
    likes: 0,
    comments: 0,
    shares: 0,
  };

  posts = [newPost, ...posts];
  return { ...newPost };
}


export function getPostById(id: number): Post | undefined {
  return posts.find((post) => post.id === id);
}