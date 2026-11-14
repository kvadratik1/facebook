import test from 'node:test';
import assert from 'node:assert/strict';
import { loadTypescript } from './load-typescript.mjs';

function setup({ guest = false, missing = false, fail = false } = {}) {
  const saves = [], refreshed = [];
  const { createComment } = loadTypescript('app/actions/comments.ts', {
    'next/cache': { revalidatePath: path => refreshed.push(path) },
    'next/navigation': { redirect: path => { throw new Error(`redirect:${path}`); } },
    '../services/session': { getCurrentUser: async () => guest ? null : { id: 'session-user' } },
    '../services/posts': { getPostById: async () => missing ? undefined : { userId: 'post-owner' } },
    '../services/comments': { addComment: async value => {
      if (fail) throw new Error('Private database error');
      saves.push(value);
    } },
  });
  return { run: data => createComment({ error: '', success: false }, data), saves, refreshed };
}
function form(postId = '42', text = ' Hello ') {
  const data = new FormData();
  data.set('postId', postId); data.set('text', text); data.set('userId', 'spoofed-user');
  return data;
}

test('guests cannot create comments', async () => {
  const context = setup({ guest: true });
  await assert.rejects(context.run(form()), /redirect:\/login/);
  assert.equal(context.saves.length, 0);
});
test('invalid IDs and missing, blank, oversized or file text are rejected', async () => {
  const inputs = ['0', '-1', '1.5', 'NaN', '2147483648', ''].map(id => form(id));
  inputs.push(form('42', '   '), form('42', 'x'.repeat(1001)));
  const missing = form(); missing.delete('text'); inputs.push(missing);
  const file = form(); file.set('text', new Blob(['text']), 'comment.txt'); inputs.push(file);
  for (const input of inputs) {
    const context = setup();
    assert.equal((await context.run(input)).success, false);
    assert.equal(context.saves.length, 0);
    assert.deepEqual(context.refreshed, []);
  }
});
test('missing posts and database errors return safe errors without revalidation', async () => {
  for (const options of [{ missing: true }, { fail: true }]) {
    const context = setup(options);
    const result = await context.run(form());
    assert.equal(result.success, false);
    assert.ok(result.error);
    assert.ok(!result.error.includes('Private database'));
    assert.deepEqual(context.refreshed, []);
  }
});
test('success uses session identity, trims text, and refreshes the correct pages', async () => {
  const context = setup();
  assert.deepEqual(await context.run(form()), { error: '', success: true });
  assert.deepEqual(context.saves, [{ postId: 42, userId: 'session-user', text: 'Hello' }]);
  assert.deepEqual(context.refreshed, ['/posts/42', '/stream', '/users/post-owner']);
});
test('one-character and 1000-character comments are accepted', async () => {
  for (const text of ['x', 'x'.repeat(1000)]) {
    assert.equal((await setup().run(form('42', text))).success, true);
  }
});
