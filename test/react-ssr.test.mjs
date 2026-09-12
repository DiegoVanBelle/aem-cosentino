import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';

test('SSR renders authored text in the initial document preserving root instrumentation', async () => {
  assert.ok(existsSync(new URL('../react/dist/server.mjs', import.meta.url)), 'SSR build exists');
  const { transformHTML } = await import('../react/dist/server.mjs');
  const html = transformHTML('<!doctype html><html><head></head><body><main><div><div class="react-teaser accent" data-aue-resource="urn:test">'
    + '<div><div>Hello &amp; welcome</div></div><div><div>Details</div></div></div><div class="quote"><div>Vanilla</div></div></div></main></body></html>');
  assert.match(html, /<h2>Hello &amp; welcome<\/h2>/);
  assert.match(html, /class="react-teaser accent"/);
  assert.match(html, /data-aue-resource="urn:test"/);
  assert.match(html, /data-react-props=/);
  assert.match(html, /<div class="quote"><div>Vanilla<\/div><\/div>/);
  assert.match(html, /class="appear"/);
});

test('SSR renders the authored React button in the initial document', async () => {
  const { transformHTML } = await import('../react/dist/server.mjs');
  const html = transformHTML('<!doctype html><html><body><main><div class="react-button" data-aue-resource="urn:button">'
    + '<div><div>Request a sample</div></div></div></main></body></html>');
  assert.match(html, /<button[^>]*>Request a sample<\/button>/);
  assert.match(html, /data-react-ssr="react-button"/);
  assert.match(html, /data-aue-resource="urn:button"/);
});
