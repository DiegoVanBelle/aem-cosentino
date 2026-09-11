import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';

test('offline fixture serves only an explicit public manifest', async (t) => {
  assert.ok(existsSync(new URL('../react/fixture.mjs', import.meta.url)), 'fixture exists');
  const { createFixture } = await import('../react/fixture.mjs');
  const server = createFixture();
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  t.after(() => { server.closeAllConnections(); server.close(); });
  const url = `http://127.0.0.1:${server.address().port}`;
  const html = await (await fetch(url)).text();
  assert.match(html, /Content-Security-Policy/);
  assert.match(html, /react-teaser/);
  assert.match(await (await fetch(`${url}/scripts/scripts.js`)).text(), /decorateMain/);
  assert.equal((await fetch(`${url}/package.json`)).status, 404);
  assert.equal((await fetch(`${url}/react/gateway.mjs`)).status, 404);
});
