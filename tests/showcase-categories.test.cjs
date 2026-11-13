/* eslint-disable @typescript-eslint/no-require-imports */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const Module = require('node:module');
const path = require('node:path');
const ts = require('typescript');
const filename = path.resolve('lib/showcase/categories.ts');
const compiled = ts.transpileModule(fs.readFileSync(filename, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } });
const loaded = new Module(filename, module);
loaded.paths = module.paths;
loaded._compile(compiled.outputText, filename);
const { createCategorySlug, getShowcaseCategories, resolveShowcaseCategory, buildShowcaseCategoryHref } = loaded.exports;
const category = (id, name) => ({ id, name, icon: 'star', sort_order: 0, created_at: '' });
const asset = (id, categoryId, kind = 'image', extra = {}) => ({ id, category_id: categoryId, media_type: kind, status: 'published', is_active: true, ...extra });

test('category names produce readable English and Tamil URL values', () => {
  assert.equal(createCategorySlug(' Welcome Girls '), 'Welcome Girls');
  assert.equal(createCategorySlug('DJ & Live Music!'), 'DJ & Live Music!');
  assert.equal(createCategorySlug('சண்டா மேளம்'), 'சண்டா மேளம்');
  assert.equal(createCategorySlug('  ✨  '), '✨');
  assert.equal(buildShowcaseCategoryHref('Welcome Girls'), '/showcase?category=Welcome%20Girls');
  assert.equal(new URL(buildShowcaseCategoryHref('சண்டா மேளம்'), 'https://example.test').searchParams.get('category'), 'சண்டா மேளம்');
});
test('colliding names get unique deterministic name slugs regardless of display order', () => {
  const rows = [category('uuid1', 'Fire & Light'), category('uuid2', 'Fire + Light'), category('uuid3', 'Fire Light 2')];
  const forward = getShowcaseCategories(rows, []);
  const reversed = getShowcaseCategories([...rows].reverse(), []);
  assert.equal(new Set(forward.map(row => row.slug)).size, 3);
  for (const row of forward) {
    assert.equal(row.slug, reversed.find(other => other.id === row.id).slug);
    assert.ok(!buildShowcaseCategoryHref(row.slug).includes(row.id));
  }
});
test('collections expose published active covers and counts only', () => {
  const rows = getShowcaseCategories([category('dj', 'DJ'), category('fog', 'Low Fog')], [
    asset('video', 'dj', 'video'), asset('photo', 'dj'),
    asset('hidden', 'dj', 'image', { is_active: false }),
    asset('pending', 'fog', 'image', { status: 'pending' }),
  ]);
  assert.equal(rows[0].media_count, 2);
  assert.equal(rows[0].cover.id, 'photo');
  assert.equal(rows[1].media_count, 0);
  assert.equal(rows[1].cover, null);
  assert.equal(getShowcaseCategories([category('dj', 'DJ')], [asset('video', 'dj', 'video')])[0].cover.id, 'video');
});
test('resolves name slugs and legacy IDs while rejecting missing categories', () => {
  const rows = getShowcaseCategories([category('12345678-1234-4234-8234-123456789abc', 'Welcome Girls')], []);
  for (const token of ['welcome girls', 'Welcome Girls', rows[0].id]) assert.equal(resolveShowcaseCategory(rows, token).id, rows[0].id);
  for (const token of ['', null, undefined, 'missing']) assert.equal(resolveShowcaseCategory(rows, token), null);
});

test('adding a punctuation collision cannot transfer an existing category URL', () => {
  const original = category('original-id', 'Fire + Light');
  const before = getShowcaseCategories([original], [])[0];
  const after = getShowcaseCategories([original, category('new-id', 'Fire & Light')], []);
  assert.equal(resolveShowcaseCategory(after, before.slug)?.id, original.id);
  assert.equal(after.find(row => row.id === original.id).slug, before.slug);
});
