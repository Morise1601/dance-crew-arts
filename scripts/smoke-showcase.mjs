const base = process.env.SHOWCASE_TEST_ORIGIN || 'http://localhost:3100';
for (const pathname of ['/showcase', '/showcase?category=missing', '/portfolio', '/admin/qr-showcase']) {
  const response = await fetch(`${base}${pathname}`, { redirect: 'manual', signal: AbortSignal.timeout(60000) });
  const html = await response.text();
  console.log(pathname, { status: response.status, redirect: response.headers.get('location'), html: html.includes('<html'), serverError: html.includes('Application error:') });
  if (response.status >= 500 || html.includes('Application error:')) process.exitCode = 1;
  if (pathname === '/showcase') {
    const categoryLinks = [...new Set([...html.matchAll(/href="(\/showcase\?category=[^"]+)"/g)].map(match => match[1]))];
    const exposedUuid = categoryLinks.some(href => /category=[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}(?:$|&)/i.test(href));
    console.log('Category links:', { count: categoryLinks.length, nameBased: !exposedUuid });
    if (exposedUuid) process.exitCode = 1;
    if (categoryLinks[0]) {
      const collection = await fetch(`${base}${categoryLinks[0]}`, { signal: AbortSignal.timeout(60000) });
      console.log('First collection:', { status: collection.status });
      if (!collection.ok) process.exitCode = 1;
    }
  }
}
