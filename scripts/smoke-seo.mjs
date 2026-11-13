import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

try { process.loadEnvFile('.env.local'); } catch { /* Hosting may inject the environment directly. */ }
const base = process.env.SEO_TEST_ORIGIN || 'http://localhost:3100';
const production = process.env.NEXT_PUBLIC_SITE_URL ? new URL(process.env.NEXT_PUBLIC_SITE_URL).origin : 'https://dance-crew-arts.vercel.app';
const publicPaths = ['/', '/about', '/services', '/portfolio', '/showcase', '/contact'];
const headers = { 'User-Agent': 'Twitterbot/1.0' };
const titles = new Set();
for (const pathname of publicPaths) {
  const response = await fetch(`${base}${pathname}`, { headers, signal: AbortSignal.timeout(60000) });
  assert.equal(response.status, 200, pathname);
  const html = await response.text();
  const head = html.slice(0, html.indexOf('</head>'));
  const title = head.match(/<title>([^<]+)<\/title>/)?.[1];
  assert.ok(title?.includes('Art Crew'), `Page title missing: ${pathname}`);
  assert.ok(!titles.has(title), `Duplicate page title: ${pathname}`); titles.add(title);
  const canonical = head.match(/rel="canonical" href="([^\"]+)"/)?.[1];
  assert.equal(canonical && new URL(canonical).href, new URL(`${production}${pathname}`).href, `Wrong canonical: ${pathname}`);
  assert.match(head, /name="description" content="[^\"]+"/);
  assert.match(head, /property="og:image" content="[^\"]+\/Banner\.png"/);
  assert.match(head, /name="twitter:card" content="summary_large_image"/);
  assert.ok(head.includes('href="/favicon.ico"'));
  assert.ok(html.includes('application/ld+json'));
  console.log(pathname, 'head metadata verified');
}
for (const pathname of ['/admin', '/booking', '/blog', '/testimonials']) {
  const response = await fetch(`${base}${pathname}`, { headers, redirect: 'manual', signal: AbortSignal.timeout(60000) });
  assert.equal(response.status, 200, pathname);
  assert.match(response.headers.get('x-robots-tag') || '', /noindex/);
  const html = await response.text();
  assert.match(html, /name="robots" content="[^\"]*noindex/);
  console.log(pathname, 'noindex metadata and response header verified');
}
const sitemap = await fetch(`${base}/sitemap.xml`);
assert.equal(sitemap.status, 200);
assert.match(sitemap.headers.get('content-type') || '', /xml/);
const xml = await sitemap.text();
const locations = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(match => match[1]);
assert.deepEqual(locations.sort(), publicPaths.map(pathname => `${production}${pathname}`).sort());
const robots = await fetch(`${base}/robots.txt`);
assert.equal(robots.status, 200);
assert.ok((await robots.text()).includes(`Sitemap: ${production}/sitemap.xml`));
const favicon = await fetch(`${base}/favicon.ico`);
assert.equal(favicon.status, 200);
assert.ok(Buffer.from(await favicon.arrayBuffer()).equals(await readFile('public/favicon.ico')));
console.log('Sitemap, robots and supplied favicon bytes verified');
