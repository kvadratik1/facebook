import test from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import dotenv from 'dotenv';
import { loadTypescript } from './load-typescript.mjs';

dotenv.config({ path: '.env.local', quiet: true });

test('comment SQL: pagination, foreign keys, atomicity and concurrent submissions', {
  skip: process.env.TEST_DATABASE !== '1',
}, async () => {
  // All writes go to a uniquely named test schema, removed in finally.
  const schemaName = `comments_test_${randomUUID().replaceAll('-', '')}`;
  const admin = postgres(process.env.DATABASE_URL, { max: 1, onnotice: () => {} });
  let pool;
  const connections = [];
  let client;
  try {
    await admin.unsafe(`create schema "${schemaName}"`);
    // A direct connection preserves search_path; transaction poolers may discard it.
    const directUrl = new URL(process.env.DATABASE_URL);
    directUrl.hostname = directUrl.hostname.replace('-pooler.', '.');
    pool = postgres(directUrl.toString(), { max: 5, onnotice: () => {} });
    for (let i = 0; i < 5; i++) {
      const connection = await pool.reserve();
      connections.push(connection);
      // Reserved postgres-js connections share the pool's type configuration.
      connection.options = pool.options;
      await connection.unsafe(`set search_path to "${schemaName}"`);
      const [location] = await connection`select current_schema() as name`;
      assert.equal(location.name, schemaName, 'Refuse to run outside the isolated test schema');
    }
    client = connections[0];
    const [location] = await client`select current_schema() as name`;
    assert.equal(location.name, schemaName, 'Refuse to run outside the isolated test schema');
    await client`create table users (id uuid primary key, name text not null, avatar_url text)`;
    await client`create table posts (id serial primary key, comments integer not null default 0)`;
    await client`create table comments (
      id serial primary key, text text not null,
      user_id uuid not null references users(id),
      post_id integer not null references posts(id) on delete cascade,
      created_at timestamptz not null default now()
    )`;
    const schema = loadTypescript('db/schema.ts');
    const databases = connections.map(connection => drizzle(connection, { schema }));
    const database = databases[0];
    let nextConnection = 0;
    // Neon HTTP returns { rows }, whereas postgres-js returns the rows directly.
    const db = new Proxy(database, { get(target, key) {
      if (key === 'execute') return async query => ({ rows: await databases[nextConnection++ % databases.length].execute(query) });
      const value = Reflect.get(target, key);
      return typeof value === 'function' ? value.bind(target) : value;
    } });
    const { getComments, getCommentBatch, addComment } = loadTypescript('app/services/comments.ts', {
      '../../db': { db }, '../../db/schema': schema,
    });
    const userId = randomUUID();
    await client`insert into users values (${userId}, 'Test Author', null)`;
    const [post] = await client`insert into posts default values returning id`;
    const postId = post.id;
    const empty = await getComments({ postId });
    assert.deepEqual(empty, { comments: [], total: 0, pages: 0, page: 1, size: 10 });
    for (const options of [{ page: 0 }, { page: 1.2 }, { size: 0 }, { size: 51 }, { page: Number.MAX_SAFE_INTEGER }]) {
      await assert.rejects(getComments({ postId, ...options }));
    }
    for (const text of [' ', 'x'.repeat(1001)]) await assert.rejects(addComment({ postId, userId, text }));
    assert.deepEqual(await getCommentBatch({ postId }), { comments: [], nextCursor: null });
    for (const cursor of ['', 'bad', 'a'.repeat(513)]) {
      await assert.rejects(getCommentBatch({ postId, cursor }), /Invalid comment cursor/);
    }
    const first = await addComment({ postId, userId, text: ' First comment ' });
    assert.equal(first.text, 'First comment');
    assert.ok(first.createdAt instanceof Date);
    await Promise.all(Array.from({ length: 22 }, (_, index) => addComment({ postId, userId, text: `Concurrent ${index}` })));
    const [counter] = await client`select comments from posts where id=${postId}`;
    assert.equal(counter.comments, 23);
    const firstPage = await getComments({ postId });
    const secondPage = await getComments({ postId, page: 2 });
    const lastPage = await getComments({ postId, page: 3 });
    assert.equal(firstPage.total, 23); assert.equal(firstPage.pages, 3);
    assert.equal(firstPage.comments.length, 10); assert.equal(secondPage.comments.length, 10);
    assert.equal(lastPage.comments.length, 3);
    const combined = [...firstPage.comments, ...secondPage.comments, ...lastPage.comments];
    assert.equal(new Set(combined.map(row => row.id)).size, 23);
    const expectedOrder = await client`select id from comments where post_id=${postId} order by created_at desc, id desc`;
    assert.deepEqual(combined.map(row => row.id), expectedOrder.map(row => row.id));
    // Exact ties must use descending IDs, independent of timestamp precision.
    await client`update comments set created_at='2026-01-01T00:00:00Z' where post_id=${postId}`;
    const tied = await getComments({ postId, size: 50 });
    assert.deepEqual(tied.comments.map(row => row.id), combined.map(row => row.id).sort((a, b) => b - a));
    const outside = await getComments({ postId, page: 100 });
    assert.equal(outside.total, 23); assert.deepEqual(outside.comments, []);
    await client`update users set name='Renamed Author', avatar_url='https://example.com/photo.png' where id=${userId}`;
    const renamed = await getComments({ postId });
    assert.equal(renamed.comments[0].author, 'Renamed Author');
    assert.equal(renamed.comments[0].authorAvatarUrl, 'https://example.com/photo.png');
    await assert.rejects(addComment({ postId: 2147483647, userId, text: 'Missing post' }));
    await assert.rejects(addComment({ postId, userId: randomUUID(), text: 'Missing user' }));
    // Cursor traversal with exact timestamp ties.
    const batch1 = await getCommentBatch({ postId });
    const batch2 = await getCommentBatch({ postId, cursor: batch1.nextCursor });
    const batch3 = await getCommentBatch({ postId, cursor: batch2.nextCursor });
    assert.deepEqual([batch1.comments.length, batch2.comments.length, batch3.comments.length], [10, 10, 3]);
    assert.equal(batch3.nextCursor, null);
    assert.deepEqual([...batch1.comments, ...batch2.comments, ...batch3.comments].map(row => row.id), tied.comments.map(row => row.id));
    await assert.rejects(getCommentBatch({ postId: postId + 1, cursor: batch1.nextCursor }), /Invalid comment cursor/);
    // Sub-millisecond timestamps must not cause missing comments at a batch boundary.
    await client`update comments set created_at='2026-01-01T00:00:00Z'::timestamptz + id * interval '1 microsecond' where post_id=${postId}`;
    const precise1 = await getCommentBatch({ postId });
    const precise2 = await getCommentBatch({ postId, cursor: precise1.nextCursor });
    const precise3 = await getCommentBatch({ postId, cursor: precise2.nextCursor });
    assert.deepEqual([...precise1.comments, ...precise2.comments, ...precise3.comments].map(row => row.id), tied.comments.map(row => row.id));
    // Exactly ten rows should end immediately, without a redundant empty request.
    const [exactPost] = await client`insert into posts default values returning id`;
    await client`insert into comments(text,user_id,post_id) select 'Exact batch', ${userId}::uuid, ${exactPost.id} from generate_series(1,10)`;
    const exact = await getCommentBatch({ postId: exactPost.id });
    assert.equal(exact.comments.length, 10); assert.equal(exact.nextCursor, null);
    // A newer comment arriving between requests must not shift the next batch.
    await addComment({ postId, userId, text: 'New arrival' });
    const stable = await getCommentBatch({ postId, cursor: precise1.nextCursor });
    assert.deepEqual(stable.comments.map(row => row.id), precise2.comments.map(row => row.id));
    // Force the counter update to fail after the insert, proving the insert rolls back too.
    await client`alter table posts add constraint test_counter_limit check (comments <= 24)`;
    await assert.rejects(addComment({ postId, userId, text: 'Must roll back' }));
    const [verified] = await client`select comments, (select count(*)::int from comments where post_id=${postId}) as actual from posts where id=${postId}`;
    assert.deepEqual(verified, { comments: 24, actual: 24 });
  } finally {
    for (const connection of connections) connection.release();
    if (pool) await pool.end();
    await admin.unsafe(`drop schema if exists "${schemaName}" cascade`);
    await admin.end();
  }
});
