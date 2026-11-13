import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';

// Downloads the existing brand fonts from Google, without changing their design.
const families = [
  { name: 'Montserrat', slug: 'montserrat', weights: '300..900' },
  { name: 'Cinzel', slug: 'cinzel', weights: '400..900' },
];
const headers = { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' };
const downloads = await Promise.all(families.map(async family => {
  const cssResponse = await fetch(`https://fonts.googleapis.com/css2?family=${family.name}:wght@${family.weights}&display=swap`, { headers, signal: AbortSignal.timeout(30000) });
  assert.ok(cssResponse.ok, `${family.name} CSS request failed`);
  const css = await cssResponse.text();
  const latin = css.match(/\/\* latin \*\/\s*(@font-face\s*\{[^}]+\})/);
  assert.ok(latin, `Latin subset missing for ${family.name}`);
  const fontUrl = latin[1].match(/src:\s*url\(([^)]+)\)/)?.[1];
  assert.ok(fontUrl && new URL(fontUrl).hostname === 'fonts.gstatic.com');
  const [fontResponse, licenseResponse] = await Promise.all([
    fetch(fontUrl, { signal: AbortSignal.timeout(30000) }),
    fetch(`https://raw.githubusercontent.com/google/fonts/main/ofl/${family.slug}/OFL.txt`, { signal: AbortSignal.timeout(30000) }),
  ]);
  assert.ok(fontResponse.ok && licenseResponse.ok, `${family.name} asset request failed`);
  const bytes = Buffer.from(await fontResponse.arrayBuffer());
  const license = await licenseResponse.text();
  assert.equal(bytes.subarray(0, 4).toString(), 'wOF2');
  assert.ok(license.includes('SIL OPEN FONT LICENSE'));
  return { ...family, bytes, license };
}));
await mkdir('app/fonts', { recursive: true });
for (const font of downloads) {
  await writeFile(`app/fonts/${font.slug}-latin.woff2`, font.bytes);
  await writeFile(`app/fonts/${font.slug}-OFL.txt`, font.license);
  console.log(`${font.name}: ${font.bytes.length} bytes; WOFF2 and license verified.`);
}
