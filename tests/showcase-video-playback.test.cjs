/* eslint-disable @typescript-eslint/no-require-imports -- Node's CJS harness loads the TypeScript helper without an extra test runner. */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const Module = require('node:module');
const path = require('node:path');
const ts = require('typescript');

const filename = path.resolve('components/showcase/video-playback.ts');
const source = fs.readFileSync(filename, 'utf8');
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } });
const loaded = new Module(filename, module);
loaded.paths = module.paths;
loaded._compile(compiled.outputText, filename);
const { playVideoWithFallback } = loaded.exports;

test('requests audible playback synchronously while the opening click is active', async () => {
  let called = false;
  const video = { muted: false, play() { called = true; return Promise.resolve(); }, pause() {} };
  const result = playVideoWithFallback(video);
  assert.equal(called, true);
  assert.equal(video.muted, false);
  assert.equal(await result, 'playing');
});

test('retries with muted playback when the browser blocks sound', async () => {
  const requestedModes = [];
  const video = { muted: false, async play() { requestedModes.push(this.muted); if (!this.muted) throw new Error('NotAllowedError'); }, pause() {} };
  assert.equal(await playVideoWithFallback(video), 'muted');
  assert.deepEqual(requestedModes, [false, true]);
});

test('reports a blocked player when even muted playback needs another tap', async () => {
  const video = { muted: false, async play() { throw new Error('NotAllowedError'); }, pause() {} };
  assert.equal(await playVideoWithFallback(video), 'blocked');
});

test('does not retry playback after the viewer has closed', async () => {
  const controller = new AbortController();
  let rejectPlay;
  let playCount = 0;
  const video = { muted: false, play() { playCount += 1; return new Promise((resolve, reject) => { rejectPlay = reject; }); }, pause() {} };
  const result = playVideoWithFallback(video, controller.signal);
  controller.abort();
  rejectPlay(new Error('NotAllowedError'));
  assert.equal(await result, 'cancelled');
  assert.equal(playCount, 1);
});

test('pauses a late playback success after the viewer has closed', async () => {
  const controller = new AbortController();
  let resolvePlay;
  let pauseCount = 0;
  const video = { muted: false, play() { return new Promise((resolve) => { resolvePlay = resolve; }); }, pause() { pauseCount += 1; } };
  const result = playVideoWithFallback(video, controller.signal);
  controller.abort();
  resolvePlay();
  assert.equal(await result, 'cancelled');
  assert.equal(pauseCount, 1);
});
