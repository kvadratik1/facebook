import { and, count, desc, eq, getTableColumns, sql } from "drizzle-orm";
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

export type CommentBatch = {
  comments: CommentWithAuthor[];
  nextCursor: string | null;
};

type CommentCursor = { postId: number; id: number; createdAt: string };

export class InvalidCommentCursorError extends Error {
  constructor() {
    super("Invalid comment cursor.");
  }
}

function readCursor(value: string, postId: number): CommentCursor {
  try {
    if (typeof value !== "string" || value.length > 512 || !/^[A-Za-z0-9_-]+$/.test(value)) {
      throw new Error();
    }
    const cursor = JSON.parse(Buffer.from(value, "base64url").toString("utf8"));
    if (
      !cursor || cursor.postId !== postId ||
      !Number.isSafeInteger(cursor.id) || cursor.id <= 0 || cursor.id > 2147483647 ||
      typeof cursor.createdAt !== "string" ||
      !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{6}Z$/.test(cursor.createdAt) ||
      new Date(cursor.createdAt).toISOString().slice(0, 23) !== cursor.createdAt.slice(0, 23)
    ) {
      throw new Error();
    }
    return cursor;
  } catch {
    throw new InvalidCommentCursorError();
  }
}

export async function getCommentBatch({ postId, cursor }: {
  postId: number;
  cursor?: string;
}): Promise<CommentBatch> {
  validatePostId(postId);
  const bookmark = cursor === undefined ? null : readCursor(cursor, postId);
  const batchSize = 10;

  const rows = await db.select({
    ...getTableColumns(comments),
    author: users.name,
    authorAvatarUrl: users.avatarUrl,
    // Keep all six fractional digits for the cursor; JS Date only keeps three.
    cursorTimestamp: sql<string>`to_char(${comments.createdAt} at time zone 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.US"Z"')`,
  })
    .from(comments)
    .innerJoin(users, eq(comments.userId, users.id))
    .where(and(
      eq(comments.postId, postId),
      bookmark
        ? sql`(${comments.createdAt}, ${comments.id}) < (${bookmark.createdAt}::timestamptz, ${bookmark.id}::integer)`
        : undefined,
    ))
    .orderBy(desc(comments.createdAt), desc(comments.id))
    .limit(batchSize + 1);

  const visibleRows = rows.slice(0, batchSize);
  const lastComment = visibleRows.at(-1);
  const hasMore = rows.length > batchSize;
  const nextCursor = hasMore && lastComment
    ? Buffer.from(JSON.stringify({
        postId,
        id: lastComment.id,
        createdAt: lastComment.cursorTimestamp,
      } satisfies CommentCursor)).toString("base64url")
    : null;

  return {
    comments: visibleRows.map(row => {
      // The exact timestamp is only needed inside the next cursor.
      const { cursorTimestamp, ...comment } = row;
      void cursorTimestamp;
      return comment;
    }),
    nextCursor,
  };
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
