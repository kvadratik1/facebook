import { integer, pgTable, serial, text } from "drizzle-orm/pg-core";

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
});

export type Post = typeof posts.$inferSelect;
export type NewPost = typeof posts.$inferInsert;
