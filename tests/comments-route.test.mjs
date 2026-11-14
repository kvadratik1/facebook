import test from 'node:test';
import assert from 'node:assert/strict';
import { loadTypescript } from './load-typescript.mjs';

class InvalidCommentCursorError extends Error {}

function setup({ missing = false, failure, batch = { comments: [], nextCursor: null } } = {}) {
  const calls = [];
  const { GET } = loadTypescript('app/api/posts/[id]/comments/route.ts', {
    '../../../../services/posts': { getPostById: async () => missing ? undefined : { id: 42 } },
    '../../../../services/comments': {
      InvalidCommentCursorError,
      getCommentBatch: async input => {
        calls.push(input);
        if (failure) throw failure;
        return batch;
      },
    },
  });
  return {
    calls,
    get: (id = '42', query = '') => GET(new Request(`http://localhost/api/posts/${id}/comments${query}`), {
      params: Promise.resolve({ id }),
    }),
  };
}

test('public GET returns the first batch without requiring a session', async () => {
  const context = setup();
  const response = await context.get();
  assert.equal(response.status, 200);
  assert.equal(response.headers.get('cache-control'), 'no-store');
  assert.deepEqual(await response.json(), { comments: [], nextCursor: null });
  assert.deepEqual(context.calls, [{ postId: 42, cursor: undefined }]);
});

test('GET forwards the cursor and serializes dates as strings', async () => {
  const context = setup({ batch: {
    comments: [{ id: 1, createdAt: new Date('2026-01-01T00:00:00Z') }], nextCursor: 'next-bookmark',
  } });
  const response = await context.get('42', '?cursor=bookmark');
  assert.deepEqual(context.calls, [{ postId: 42, cursor: 'bookmark' }]);
  assert.deepEqual(await response.json(), {
    comments: [{ id: 1, createdAt: '2026-01-01T00:00:00.000Z' }], nextCursor: 'next-bookmark',
  });
});

test('invalid IDs and repeated cursors are rejected before fetching comments', async () => {
  for (const id of ['0', '-1', '1.5', 'abc', '2147483648', '1e2']) {
    const context = setup();
    assert.equal((await context.get(id)).status, 400);
    assert.deepEqual(context.calls, []);
  }
  const context = setup();
  assert.equal((await context.get('42', '?cursor=a&cursor=b')).status, 400);
  assert.deepEqual(context.calls, []);
});

test('missing posts return 404', async () => {
  const context = setup({ missing: true });
  assert.equal((await context.get()).status, 404);
  assert.deepEqual(context.calls, []);
});

test('invalid cursors return 400 and database errors return a safe 500', async () => {
  const invalid = await setup({ failure: new InvalidCommentCursorError('Invalid comment cursor.') }).get();
  assert.equal(invalid.status, 400);
  const failed = await setup({ failure: new Error('Private database details') }).get();
  assert.equal(failed.status, 500);
  assert.deepEqual(await failed.json(), { error: 'Could not load comments. Please try again.' });
});
