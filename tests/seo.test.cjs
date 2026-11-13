/* eslint-disable @typescript-eslint/no-require-imports */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');

function load(relative) {
  const filename = path.resolve(relative);
  const source = fs.readFileSync(filename, 'utf8');
  const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  const loaded = { exports: {} };
  const localRequire = name => name === '@/lib/seo' ? load('lib/seo.ts') : require(name);
  new Function('require', 'module', 'exports', compiled)(localRequire, loaded, loaded.exports);
  return loaded.exports;
}

test('canonical origin uses the supplied production site and safely normalizes overrides', () => {
  const { getSiteOrigin } = load('lib/seo.ts');
  assert.equal(getSiteOrigin('https://dance-crew-arts.vercel.app/'), 'https://dance-crew-arts.vercel.app');
  assert.equal(getSiteOrigin('https://example.com/path?query=1#fragment'), 'https://example.com');
  assert.throws(() => getSiteOrigin('javascript:alert(1)'), /http/i);
  assert.throws(() => getSiteOrigin('https://user:password@example.com'), /credentials/i);
});
test('every indexable page has a unique title and a self canonical URL', () => {
  const { INDEXABLE_PATHS, createPageMetadata } = load('lib/seo.ts');
  const titles = [];
  for (const pathname of INDEXABLE_PATHS) {
    const metadata = createPageMetadata(pathname);
    assert.ok(metadata.description.length > 40);
    assert.equal(new URL(metadata.alternates.canonical).pathname, pathname);
    assert.equal(new URL(metadata.openGraph.url).href, metadata.alternates.canonical);
    assert.ok(metadata.openGraph.images[0].url.includes('/Banner.png'));
    if (pathname === '/') assert.equal(metadata.title.absolute, "Dance Training & Choreography | D'Art Crew");
    titles.push(metadata.title);
  }
  assert.equal(new Set(titles).size, INDEXABLE_PATHS.length);
});
test('sitemap lists only canonical public pages on the confirmed origin', () => {
  const { INDEXABLE_PATHS } = load('lib/seo.ts');
  const rows = load('app/sitemap.ts').default();
  assert.deepEqual(rows.map(row => new URL(row.url).pathname).sort(), [...INDEXABLE_PATHS].sort());
  assert.ok(rows.every(row => new URL(row.url).search === '' && !('lastModified' in row)));
  assert.ok(rows.every(row => !/admin|booking|blog|testimonials|instructors|faq|terms|privacy/.test(row.url)));
});
test('admin and unfinished pages carry noindex without blocking the directive in robots', () => {
  const { createPageMetadata, getRobotsMetadata } = load('lib/seo.ts');
  for (const pathname of ['/admin', '/booking', '/blog', '/testimonials']) assert.equal(createPageMetadata(pathname).robots.index, false);
  assert.equal(getRobotsMetadata(true).index, false);
  const robots = load('app/robots.ts').default();
  assert.ok(robots.sitemap.endsWith('/sitemap.xml'));
  assert.ok(!JSON.stringify(robots.rules).includes('/admin'));
});
test('root icon configuration points to the supplied public icon without a conflicting route', () => {
  const { createRootMetadata } = load('lib/seo.ts');
  assert.equal(createRootMetadata().icons.icon[0].url, '/favicon.ico');
  assert.equal(fs.existsSync('app/favicon.ico'), false);
  const icon = fs.readFileSync('public/favicon.ico');
  assert.equal(icon.readUInt16LE(0), 0);
  assert.equal(icon.readUInt16LE(2), 1);
  assert.ok(icon.readUInt16LE(4) > 0);
});
