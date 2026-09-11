import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { parseHTML } from 'linkedom';

test('client hydrates identical SSR and renders replacement raw blocks', async () => {
  assert.ok(existsSync(new URL('../scripts/react-islands.js', import.meta.url)), 'client bundle exists');
  const { transformHTML } = await import('../react/dist/server.mjs');
  const { window } = parseHTML(transformHTML('<!doctype html><html><head></head><body><main><div class="react-teaser"><div><div>Hydrated</div></div></div></main></body></html>'));
  globalThis.window = window;
  globalThis.document = window.document;
  const { mount } = await import('../scripts/react-islands.js');
  const block = document.querySelector('.react-teaser');
  const original = block.querySelector('h2');
  mount(block);
  await new Promise((r) => setTimeout(r, 50));
  assert.equal(block.querySelector('h2'), original);
  block.querySelector('button').click();
  await new Promise((r) => setTimeout(r, 20));
  assert.equal(block.querySelector('button').getAttribute('aria-expanded'), 'true');
  const raw = document.createElement('div');
  raw.className = 'react-teaser';
  raw.innerHTML = '<div><div>Updated</div></div>';
  document.body.append(raw);
  mount(raw);
  await new Promise((r) => setTimeout(r, 20));
  assert.equal(raw.querySelector('h2').textContent, 'Updated');
});
