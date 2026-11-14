import { count, desc, eq, getTableColumns, sql } from "drizzle-orm";
import { db } from "../../db";
import { comments, users, type Comment } from "../../db/schema";

export type CommentWithAuthor = Comment & { author: string; authorAvatarUrl: string | null };

export type CommentsPage = {
  comments: CommentWithAuthor[];
  total: number;
  pages: number;
  page: number;
  size: number;
};

function validatePostId(postId: number) {
  if (!Number.isSafeInteger(postId) || postId <= 0 || postId > 2147483647) {
    throw new Error("Invalid post ID.");
  }
}

export async function getComments({
  postId,
  page = 1,
  size = 10,
}: {
  postId: number;
  page?: number;
  size?: number;
}): Promise<CommentsPage> {
  validatePostId(postId);
  if (!Number.isSafeInteger(page) || page < 1) {
    throw new Error("Page must be a positive integer.");
  }
  if (!Number.isSafeInteger(size) || size < 1 || size > 50) {
    throw new Error("Page size must be between 1 and 50.");
  }
  const offset = (page - 1) * size;
  if (!Number.isSafeInteger(offset)) {
    throw new Error("Page is too large.");
  }

  // Fetch the total count and the requested comments as two independent queries.
  const [countRows, pageComments] = await Promise.all([
    db.select({ total: count() })
      .from(comments)
      .where(eq(comments.postId, postId)),

    db.select({ ...getTableColumns(comments), author: users.name, authorAvatarUrl: users.avatarUrl })
      .from(comments)
      .innerJoin(users, eq(comments.userId, users.id))
      .where(eq(comments.postId, postId))
      .orderBy(desc(comments.createdAt), desc(comments.id))
      .limit(size)
      .offset(offset),
  ]);

  const total = countRows[0].total;

  return {
    comments: pageComments,
    total,
    pages: Math.ceil(total / size),
    page,
    size,
  };
}

// The caller must obtain userId from the authenticated server session.
export async function addComment({ postId, userId, text }: {
  postId: number;
  userId: string;
  text: string;
}): Promise<Comment> {
  validatePostId(postId);
  if (typeof text !== "string" || text.trim().length < 1 || text.trim().length > 1000) {
    throw new Error("Comment must contain 1–1,000 characters.");
  }
  if (typeof userId !== "string" || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId)) {
    throw new Error("Invalid user ID.");
  }

  // A single statement works with Neon HTTP and rolls back both changes on failure.
  // Foreign keys enforce that both the post and the user exist.
  const result = await db.execute<{
    id: number;
    text: string;
    userId: string;
    postId: number;
    createdAt: string;
  }>(sql`
    with inserted as (
      insert into comments (post_id, user_id, text)
      values (${postId}, ${userId}::uuid, ${text.trim()})
      returning id, text, user_id, post_id, created_at
    ), updated as (
      update posts set comments = posts.comments + 1
      from inserted where posts.id = inserted.post_id
      returning posts.id
    )
    select inserted.id, inserted.text, inserted.user_id as "userId",
      inserted.post_id as "postId", inserted.created_at as "createdAt"
    from inserted inner join updated on updated.id = inserted.post_id
  `);
  const comment = result.rows[0];
  if (!comment) throw new Error("Could not create comment.");
  return { ...comment, createdAt: new Date(comment.createdAt) };
}
