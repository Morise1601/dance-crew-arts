const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');

function loadActions(adminAllowed = false, serviceClient = null) {
  let clientCalls = 0;
  const cache = {};
  function load(filename) {
    if (cache[filename]) return cache[filename];
    const source = fs.readFileSync(filename, 'utf8');
    const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
    const module = { exports: {} };
    const requireStub = (name) => {
      if (name === '@/lib/auth/server') return { requireAdmin: async () => { if (!adminAllowed) throw new Error('Unauthorized'); return { user: { id: 'user-id' } }; } };
      if (name === '@/lib/supabase/admin') return { createAdminClient: async () => { clientCalls++; if (serviceClient) return serviceClient; throw new Error('Unexpected database call'); } };
      if (name === 'next/cache') return { revalidatePath() {} };
      if (name.startsWith('@/')) return load(path.resolve(`${name.slice(2)}.ts`));
      return require(name);
    };
    new Function('require', 'module', 'exports', compiled)(requireStub, module, module.exports);
    cache[filename] = module.exports;
    return module.exports;
  }
  return { actions: load(path.resolve('app/admin/qr-showcase/actions.ts')), clientCalls: () => clientCalls };
}
test('all showcase mutations deny members and anonymous callers before service access', async () => {
  const { actions, clientCalls } = loadActions();
  for (const [name, args] of [
    ['saveCategory', [{name:'DJ',icon:'music',sort_order:0}]],
    ['deleteCategory', ['12345678-1234-4234-8234-123456789abc']],
    ['prepareMediaUpload', [{}]], ['completeMediaUpload', ['12345678-1234-4234-8234-123456789abc']],
    ['updateMedia', ['12345678-1234-4234-8234-123456789abc', {}]],
    ['deleteMedia', ['12345678-1234-4234-8234-123456789abc']],
  ]) assert.match((await actions[name](...args)).error, /admin|unauthorized|permission/i, name);
  assert.equal(clientCalls(), 0);
});

const mediaId = '12345678-1234-4234-8234-123456789abc';
function lifecycle({ storedMime = 'image/png', storedSize = 8, storageFailure = false, dbDeleteFailure = false } = {}) {
  const row = { id: mediaId, status: 'pending', storage_path: 'owner/file.png', url: 'https://untrusted.invalid/never-fetch', mime_type: 'image/png', size_bytes: 8 };
  const events = [];
  let removed = false;
  const client = {
    from() {
      let mutation;
      const filters = [];
      const query = {
        select() { return query; },
        eq(key, value) { filters.push([key, value]); return query; },
        update(value) { mutation = { type: 'update', value }; return query; },
        delete() { mutation = { type: 'delete' }; return query; },
        async maybeSingle() {
          if (filters.some(([key, value]) => row[key] !== value)) return { data: null, error: null };
          if (mutation) Object.assign(row, mutation.value);
          return { data: { ...row }, error: null };
        },
        then(resolve, reject) {
          let error = null;
          if (mutation?.type === 'update') { Object.assign(row, mutation.value); events.push(row.status); }
          if (mutation?.type === 'delete') {
            if (dbDeleteFailure) error = { code: 'DB_FAILURE' };
            else { removed = true; events.push('row removed'); }
          }
          return Promise.resolve({ error }).then(resolve, reject);
        },
      };
      return query;
    },
    storage: { from() { return {
      info: async () => ({ data: { size: storedSize, contentType: storedMime }, error: null }),
      getPublicUrl: () => ({ data: { publicUrl: 'https://trusted.example/storage/v1/object/public/qr-showcase/owner/file.png' } }),
      remove: async () => { events.push('file removal'); return { error: storageFailure ? new Error('offline') : null }; },
    }; } },
  };
  return { row, events, client, removed: () => removed };
}

test('server rejects mismatched stored type and size without publishing', async () => {
  for (const options of [{ storedMime: 'video/mp4' }, { storedSize: 9 }]) {
    const state = lifecycle(options);
    const { actions } = loadActions(true, state.client);
    assert.match((await actions.completeMediaUpload(mediaId)).error, /type or size/);
    assert.equal(state.row.status, 'pending');
  }
});

test('server verifies actual bytes from its trusted bucket URL before publishing', async () => {
  const previousFetch = global.fetch;
  try {
    for (const valid of [false, true]) {
      const state = lifecycle();
      let fetchedUrl;
      global.fetch = async (url) => { fetchedUrl = url; return new Response(valid ? new Uint8Array([137,80,78,71,13,10,26,10]) : new TextEncoder().encode('not an image')); };
      const result = await loadActions(true, state.client).actions.completeMediaUpload(mediaId);
      assert.match(fetchedUrl, /^https:\/\/trusted\.example\//);
      if (valid) { assert.equal(result.success, true); assert.equal(state.row.status, 'published'); }
      else { assert.match(result.error, /contents/); assert.equal(state.row.status, 'pending'); }
    }
  } finally { global.fetch = previousFetch; }
});

test('delete hides metadata before removing file and retains recoverable state on failures', async () => {
  const success = lifecycle();
  assert.equal((await loadActions(true, success.client).actions.deleteMedia(mediaId)).success, true);
  assert.deepEqual(success.events, ['deleting', 'file removal', 'row removed']);
  const storageError = lifecycle({ storageFailure: true });
  assert.ok((await loadActions(true, storageError.client).actions.deleteMedia(mediaId)).error);
  assert.equal(storageError.row.status, 'pending');
  assert.equal(storageError.removed(), false);
  const databaseError = lifecycle({ dbDeleteFailure: true });
  assert.ok((await loadActions(true, databaseError.client).actions.deleteMedia(mediaId)).error);
  assert.equal(databaseError.row.status, 'deleting');
  assert.equal(databaseError.removed(), false);
});
test('invalid IDs and metadata are rejected before database access even for admins', async () => {
  const { actions, clientCalls } = loadActions(true);
  for (const [name, args] of [
    ['saveCategory', [{name:' ',icon:'music',sort_order:0}]],
    ['deleteCategory', ['not-an-id']], ['completeMediaUpload', ['not-an-id']],
    ['updateMedia', ['not-an-id', {}]], ['deleteMedia', ['not-an-id']],
    ['prepareMediaUpload', [{name:'Event',category_id:'bad',description:'',sort_order:0,file:{name:'evil.svg',type:'image/svg+xml',size:100}}]],
  ]) assert.ok((await actions[name](...args)).error, name);
  assert.equal(clientCalls(), 0);
});
