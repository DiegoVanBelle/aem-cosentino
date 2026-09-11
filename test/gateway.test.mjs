import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { existsSync } from 'node:fs';

const listen = (server) => new Promise((resolve) => server.listen(0, '127.0.0.1', () => resolve(`http://127.0.0.1:${server.address().port}`)));
test('gateway transforms full HTML, proxies assets and rejects unsafe requests', async (t) => {
  assert.ok(existsSync(new URL('../react/gateway.mjs', import.meta.url)), 'gateway exists');
  const { createGateway } = await import('../react/gateway.mjs');
  let hits = 0;
  const upstream = createServer((req, res) => {
    hits += 1;
    if (req.url === '/redirect') { res.writeHead(302, { location: 'http://127.0.0.1:1/secret' }); res.end(); return; }
    if (req.url === '/large') { res.end('x'.repeat(10000)); return; }
    if (req.url === '/asset.svg') { res.setHeader('content-type', 'image/svg+xml'); res.end('<svg/>'); return; }
    res.setHeader('content-type', 'text/html');
    res.setHeader('etag', 'stale');
    res.setHeader('content-security-policy', "script-src 'nonce-upstream'");
    res.end('<!doctype html><html><head></head><body><main><div><div class="react-teaser"><div><div>Server title</div></div></div></div></main></body></html>');
  });
  const origin = await listen(upstream);
  const gateway = createGateway({ origin, maxBytes: 4096 });
  const url = await listen(gateway);
  t.after(() => { gateway.closeAllConnections(); gateway.close(); upstream.closeAllConnections(); upstream.close(); });
  const page = await fetch(url);
  assert.match(await page.text(), /<h2>Server title<\/h2>/);
  assert.equal(page.headers.get('cache-control'), 'no-store');
  assert.equal(page.headers.get('etag'), null);
  assert.equal(page.headers.get('content-security-policy'), "script-src 'self'; base-uri 'self'; object-src 'none'");
  assert.equal(await (await fetch(`${url}/asset.svg`)).text(), '<svg/>');
  assert.doesNotMatch(await (await fetch(`${url}/x.plain.html`)).text(), /<h2>/);
  assert.equal((await fetch(`${url}/redirect`, { redirect: 'manual' })).status, 502);
  assert.equal((await fetch(`${url}/large`)).status, 502);
  const before = hits;
  assert.equal((await fetch(`${url}//evil.example/path`)).status, 400);
  assert.equal((await fetch(url, { method: 'POST' })).status, 405);
  assert.equal((await fetch(`${url}/.env`)).status, 404);
  assert.equal(hits, before);
  assert.throws(() => createGateway({ origin: 'https://user:secret@example.com' }));
});
