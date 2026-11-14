import { pgTable, serial, text, integer, uuid, varchar, primaryKey, timestamp, index } from "drizzle-orm/pg-core";

import { relations } from "drizzle-orm";

export const posts = pgTable("posts", {
  id: serial("id").primaryKey(),
  text: text("text").notNull(),
  author: text("author").notNull(),
  initials: text("initials").notNull(),
  avatar: text("avatar").notNull(),
  time: text("time").notNull(),
  likes: integer("likes").notNull().default(0),
  comments: integer("comments").notNull().default(0),
  shares: integer("shares").notNull().default(0),
  media: text("media"),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id),
});

export type Post = typeof posts.$inferSelect;
export type NewPost = typeof posts.$inferInsert;

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  username: text("username").notNull().unique(),
  name: text("name").notNull(),
  passwordHash: text("password_hash").notNull().default(""),
  bio: varchar("bio", { length: 160 }),
  avatarUrl: text("avatar_url"),
  coverImageUrl: text("cover_image_url"),
  avatarPublicId: text("avatar_public_id"),
  coverImagePublicId: text("cover_image_public_id"),
});

export const comments = pgTable("comments", {
  id: serial("id").primaryKey(),
  text: text("text").notNull(),
  userId: uuid("user_id").notNull().references(() => users.id),
  postId: integer("post_id")
    .notNull()
    .references(() => posts.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  index("comments_post_id_created_at_id_idx").on(table.postId, table.createdAt, table.id),
]);

export type Comment = typeof comments.$inferSelect;
export type NewComment = typeof comments.$inferInsert;

export const commentsRelations = relations(comments, ({ one }) => ({
  user: one(users, {
    fields: [comments.userId],
    references: [users.id],
  }),
  post: one(posts, {
    fields: [comments.postId],
    references: [posts.id],
  }),
}));

export const usersRelations = relations(users, ({ many }) => ({
  posts: many(posts),
  comments: many(comments),
}));

export const postsRelations = relations(posts, ({ one, many }) => ({
  // Keep the relationship distinct from the posts.comments counter column.
  commentEntries: many(comments),
  user: one(users, {
    fields: [posts.userId],
    references: [users.id],
  }),
}));

// One like per user per post; post-first key also supports post lookups.
export const likes = pgTable("likes", {
  postId: integer("post_id").notNull().references(() => posts.id, { onDelete: "cascade" }),
  userId: uuid("user_id").notNull().references(() => users.id),
}, (table) => [primaryKey({ columns: [table.postId, table.userId] })]);

export type PostWithLike = Post & { likedByUser: boolean; authorAvatarUrl: string | null };
