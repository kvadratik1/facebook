import { and, eq, sql } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { getDb } from "../../db";
import { follows, users } from "../../db/schema";

export const getUserProfile = async (id: string) => {
  return getDb().query.users.findFirst({
    where: eq(users.id, id),
    columns: {
      id: true,
      username: true,
      name: true,
      bio: true,
      avatarUrl: true,
      coverImageUrl: true,
    },
  });
};

export type UserProfile = NonNullable<Awaited<ReturnType<typeof getUserProfile>>>;

export const isUserFollowing = async (followerId: string, followingId: string) => {
  const [follow] = await getDb()
    .select({ followerId: follows.followerId })
    .from(follows)
    .where(and(eq(follows.followerId, followerId), eq(follows.followingId, followingId)))
    .limit(1);

  return Boolean(follow);
};

export const toggleUserFollow = async (followerId: string, followingId: string) => {
  const db = getDb();
  const lockKey = `${followerId}:${followingId}`;
  // Lock this pair before the toggle statement takes its snapshot.
  const [, result] = await db.batch([
    db.execute(sql`select pg_advisory_xact_lock(hashtextextended(${lockKey}, 0))`),
    db.execute<{ isFollowing: boolean }>(sql`
      with target as (
        select id from users where id = ${followingId}
      ), removed as (
        delete from follows
        where follower_id = ${followerId} and following_id = (select id from target)
        returning follower_id
      ), inserted as (
        insert into follows (follower_id, following_id)
        select ${followerId}::uuid, id from target
        where not exists (select 1 from removed)
        returning follower_id
      )
      select exists (select 1 from inserted) as "isFollowing" from target
    `),
  ]);

  return result.rows[0] ?? null;
};

export const getUserFollowers = async (id: string) => {
  const follower = alias(users, "follower");
  const rows = await getDb()
    .select({
      follower: {
        id: follower.id,
        username: follower.username,
        name: follower.name,
        avatarUrl: follower.avatarUrl,
      },
    })
    .from(users)
    .leftJoin(follows, eq(follows.followingId, users.id))
    .leftJoin(follower, eq(follows.followerId, follower.id))
    .where(eq(users.id, id))
    .orderBy(follower.name, follower.id);

  if (rows.length === 0) {
    return null;
  }

  return rows.flatMap(({ follower }) => follower ? [follower] : []);
};

export const getUserFollowCounts = async (id: string) => {
  const db = getDb();
  const [counts] = await db
    .select({
      followerCount: db.$count(follows, eq(follows.followingId, id)),
      followingCount: db.$count(follows, eq(follows.followerId, id)),
    })
    .from(users)
    .where(eq(users.id, id));

  return counts ?? null;
};

export const getUserById = async (id: string) => {
  return getDb().query.users.findFirst({
    where: eq(users.id, id),
    with: {
      posts: true,
    },
  });
};

export const getUsers = async () => {
  return getDb().query.users.findMany();
};

export const getUserWithPosts = async (id: string) => {
  return getDb().query.users.findFirst({
    where: eq(users.id, id),
    with: { posts: true },
  });
};
