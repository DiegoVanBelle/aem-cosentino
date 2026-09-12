import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { parseHTML } from 'linkedom';

test('client hydrates identical SSR and renders replacement raw blocks', async () => {
  assert.ok(existsSync(new URL('../scripts/react-islands.js', import.meta.url)), 'client bundle exists');
  const { transformHTML } = await import('../react/dist/server.mjs');
  const { window } = parseHTML(transformHTML('<!doctype html><html><head></head><body><main>'
    + '<div class="react-teaser"><div><div>Hydrated</div></div></div>'
    + '<div class="react-button"><div><div>SSR button</div></div></div>'
    + '</main></body></html>'));
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

  const ssrButtonRoot = document.querySelector('.react-button');
  const ssrButton = ssrButtonRoot.querySelector('button');
  mount(ssrButtonRoot);
  await new Promise((r) => setTimeout(r, 20));
  assert.equal(ssrButtonRoot.querySelector('button'), ssrButton);
  ssrButton.click();
  await new Promise((r) => setTimeout(r, 20));
  assert.equal(ssrButton.getAttribute('aria-pressed'), 'true');

  const raw = document.createElement('div');
  raw.className = 'react-teaser';
  raw.innerHTML = '<div><div>Updated</div></div>';
  document.body.append(raw);
  mount(raw);
  await new Promise((r) => setTimeout(r, 20));
  assert.equal(raw.querySelector('h2').textContent, 'Updated');

  const rawButton = document.createElement('div');
  rawButton.className = 'react-button';
  rawButton.innerHTML = '<div><div>Choose me</div></div>';
  document.body.append(rawButton);
  mount(rawButton);
  await new Promise((r) => setTimeout(r, 20));
  const button = rawButton.querySelector('button');
  assert.equal(button.textContent.trim(), 'Choose me');
  assert.equal(button.getAttribute('aria-pressed'), 'false');
  button.click();
  await new Promise((r) => setTimeout(r, 20));
  assert.equal(button.getAttribute('aria-pressed'), 'true');
});
