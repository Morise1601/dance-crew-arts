const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const Module = require('node:module');
const path = require('node:path');
const ts = require('typescript');
const filename = path.resolve('lib/showcase/validation.ts');
const compiled = ts.transpileModule(fs.readFileSync(filename, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } });
const loaded = new Module(filename, module);
loaded.paths = module.paths;
loaded._compile(compiled.outputText, filename);
const { validateMediaFile, validateCategory, validateMediaDetails, matchesMediaSignature, isUuid } = loaded.exports;

test('allows supported nonempty files at their exact size limits', () => {
  assert.equal(validateMediaFile({ name: 'photo.JPG', type: 'image/jpeg', size: 10 * 1024 * 1024 }), null);
  assert.equal(validateMediaFile({ name: 'clip.mp4', type: 'video/mp4', size: 50 * 1024 * 1024 }), null);
  assert.equal(validateMediaFile({ name: 'clip.webm', type: 'video/webm', size: 200 }), null);
});
test('rejects missing, oversized, unsupported, fractional and spoofed files', () => {
  for (const file of [null, {name:'a.jpg',type:'image/jpeg',size:0}, {name:'a.jpg',type:'image/jpeg',size:10485761}, {name:'a.mp4',type:'video/mp4',size:52428801}, {name:'a.svg',type:'image/svg+xml',size:100}, {name:'a.png',type:'image/jpeg',size:100}, {name:'a.mp4',type:'video/mp4',size:1.5}, {name:'a.jpg',type:'',size:20}, {name:'a.jpg',type:'image/jpeg',size:NaN}]) assert.ok(validateMediaFile(file));
});
test('validates actual signatures against declared MIME', () => {
  const bytes = (...values) => new Uint8Array(values);
  const ascii = (s) => new TextEncoder().encode(s);
  assert.equal(matchesMediaSignature(bytes(255,216,255,224), 'image/jpeg'), true);
  assert.equal(matchesMediaSignature(bytes(137,80,78,71,13,10,26,10), 'image/png'), true);
  assert.equal(matchesMediaSignature(ascii('GIF89a'), 'image/gif'), true);
  assert.equal(matchesMediaSignature(ascii('RIFF0000WEBP'), 'image/webp'), true);
  assert.equal(matchesMediaSignature(bytes(0,0,0,24,102,116,121,112,105,115,111,109), 'video/mp4'), true);
  assert.equal(matchesMediaSignature(bytes(26,69,223,163,66,130,132,119,101,98,109), 'video/webm'), true);
  assert.equal(matchesMediaSignature(ascii('<script>alert(1)</script>'), 'image/jpeg'), false);
  assert.equal(matchesMediaSignature(ascii('RIFF0000WAVE'), 'image/webp'), false);
  assert.equal(matchesMediaSignature(bytes(137,80,78,71,13,10,26,10), 'video/mp4'), false);
  assert.equal(matchesMediaSignature(bytes(26,69,223,163), 'video/webm'), false);
});
test('category and media metadata are trimmed and bounded', () => {
  assert.equal(validateCategory({name:' DJ ',icon:'music',sort_order:0}), null);
  for (const value of [{name:' ',icon:'music',sort_order:0},{name:'x'.repeat(61),icon:'music',sort_order:0},{name:'DJ',icon:'evil',sort_order:0},{name:'DJ',icon:'music',sort_order:-1}]) assert.ok(validateCategory(value));
  assert.equal(validateMediaDetails({name:'Event',description:'',category_id:'12345678-1234-4234-8234-123456789abc',sort_order:0}), null);
  assert.ok(validateMediaDetails({name:'Event',description:'x'.repeat(501),category_id:'bad',sort_order:0}));
  assert.equal(isUuid('12345678-1234-4234-8234-123456789abc'), true);
  assert.equal(isUuid('x'), false);
});
