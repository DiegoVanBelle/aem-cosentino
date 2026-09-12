import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { parseHTML } from 'linkedom';
import { transformHTML } from '../react/dist/server.mjs';
import { createFixture } from '../react/fixture.mjs';
import { createGateway } from '../react/gateway.mjs';

const stylesheet = '/styles/react-tailwind.css';

test('both rendered components carry locally compiled, prefixed utilities without Preflight', async () => {
  const { document } = parseHTML(transformHTML('<!doctype html><html><head></head><body><main>'
    + '<div class="react-teaser"><div><div>Surface</div></div></div>'
    + '<div class="react-button"><div><div>Select</div></div></div></main></body></html>'));
  assert.ok(document.querySelector('article').classList.contains('tw:bg-stone-100'));
  assert.ok(document.querySelector('.react-button button').classList.contains('tw:bg-stone-900'));
  const css = await readFile(new URL('../styles/react-tailwind.css', import.meta.url), 'utf8');
  assert.match(css, /tailwindcss/);
  assert.ok(css.includes('.tw\\:bg-stone-100'));
  assert.ok(css.includes('.tw\\:bg-stone-900'));
  assert.ok(css.includes('aria-pressed'));
  assert.ok(css.includes('focus-visible'));
  assert.doesNotMatch(css, /tailwindcss\/preflight|box-sizing:border-box;border:0|h1,h2,h3|img,svg,video/);
  assert.doesNotMatch(css, /(?:https?:)?\/\/cdn/);
});

test('SSR includes one blocking local utility stylesheet even without the shared AEM head', () => {
  const html = '<!doctype html><html><head></head><body><main><div class="react-teaser"><div><div>Surface</div></div></div></main></body></html>';
  const { document } = parseHTML(transformHTML(transformHTML(html)));
  const links = document.head.querySelectorAll(`link[href="${stylesheet}"]`);
  assert.equal(links.length, 1);
  assert.equal(links[0].rel, 'stylesheet');
  assert.equal(links[0].hasAttribute('media'), false);
});

test('fixture and gateway serve the exact compiled stylesheet with CSS MIME and HEAD support', async (t) => {
  const fixture = createFixture();
  await new Promise((resolve) => fixture.listen(0, '127.0.0.1', resolve));
  const origin = `http://127.0.0.1:${fixture.address().port}`;
  const gateway = createGateway({ origin });
  await new Promise((resolve) => gateway.listen(0, '127.0.0.1', resolve));
  t.after(() => {
    [gateway, fixture].forEach((server) => { server.closeAllConnections(); server.close(); });
  });
  const css = await readFile(new URL('../styles/react-tailwind.css', import.meta.url), 'utf8');
  for (const url of [origin, `http://127.0.0.1:${gateway.address().port}`]) {
    const response = await fetch(`${url}${stylesheet}`);
    assert.equal(response.status, 200);
    assert.match(response.headers.get('content-type'), /^text\/css/);
    assert.equal(await response.text(), css);
    const head = await fetch(`${url}${stylesheet}`, { method: 'HEAD' });
    assert.equal(head.status, 200);
    assert.equal(await head.text(), '');
  }
  // The gateway serves its matching local CSS even if the origin is unavailable.
  fixture.closeAllConnections();
  await new Promise((resolve) => fixture.close(resolve));
  assert.equal(await (await fetch(`http://127.0.0.1:${gateway.address().port}${stylesheet}?v=test`)).text(), css);
});

test('shared AEM head loads utilities for direct CSR and editor documents', async () => {
  const { document } = parseHTML(`<html><head>${await readFile(new URL('../head.html', import.meta.url), 'utf8')}</head><body></body></html>`);
  assert.ok(document.head.querySelector(`link[rel="stylesheet"][href="${stylesheet}"]`));
});
