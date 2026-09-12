import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { parseHTML } from 'linkedom';

test('island guard protects authored and SSR children from vanilla mutation', async () => {
  assert.ok(existsSync(new URL('../scripts/react-support.js', import.meta.url)), 'guard exists');
  const { withReactIslands } = await import('../scripts/react-support.js');
  const { document } = parseHTML('<html><body><main><div class="react-teaser"><span class="icon">Keep</span></div>'
    + '<div class="react-button"><span class="icon">Keep button</span></div><span class="icon">Change</span></main></body></html>');
  const root = document.querySelector('.react-teaser');
  const buttonRoot = document.querySelector('.react-button');
  const child = root.firstChild;
  const buttonChild = buttonRoot.firstChild;
  withReactIslands(document.querySelector('main'), () => document.querySelectorAll('.icon').forEach((el) => el.remove()));
  assert.equal(root.firstChild, child);
  assert.equal(buttonRoot.firstChild, buttonChild);
  assert.equal(document.querySelectorAll('.icon').length, 2);
  assert.throws(() => withReactIslands(root, () => { throw new Error('test'); }));
  assert.equal(root.firstChild, child);
});

test('React button focus ring uses a contrasting page-background color', () => {
  const css = readFileSync(new URL('../styles/react-tailwind.css', import.meta.url), 'utf8');
  assert.match(css, /:focus-visible\{[^}]*outline-width:3px/);
  assert.match(css, /:focus-visible\{outline-color:var\(--tw-color-stone-900\)/);
  assert.match(css, /:focus-visible\{outline-offset:4px/);
});

test('SSR replaces incompatible nonce metadata; direct pages are visible without JS', async () => {
  const { transformHTML } = await import('../react/dist/server.mjs');
  const head = readFileSync(new URL('../head.html', import.meta.url), 'utf8');
  const html = transformHTML(`<!doctype html><html><head>${head}</head><body><main></main></body></html>`);
  assert.doesNotMatch(html, /http-equiv="Content-Security-Policy"/i);
  assert.doesNotMatch(head, /unpkg/);
  const css = readFileSync(new URL('../styles/styles.css', import.meta.url), 'utf8');
  assert.doesNotMatch(css, /body\s*\{\s*display:\s*none/);
});
