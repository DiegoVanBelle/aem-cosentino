import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { transformHTML } from './dist/server.mjs';

export function createGateway({
  origin, maxBytes = 8 * 1024 * 1024, timeout = 10000, forwardedHost,
} = {}) {
  const backend = new URL(origin);
  if (!['http:', 'https:'].includes(backend.protocol) || backend.username || backend.password
    || backend.pathname !== '/' || backend.search || backend.hash) {
    throw new Error('AEM_ORIGIN must be an HTTP(S) origin without credentials or path');
  }
  if (forwardedHost && !/^[a-z0-9.-]+(?::[0-9]+)?$/i.test(forwardedHost)) throw new Error('Invalid PUBLIC_HOST');
  let active = 0;
  const server = createServer(async (req, res) => {
    const send = (status, body = '', type = 'text/plain; charset=utf-8') => {
      res.writeHead(status, { 'content-type': type, 'cache-control': 'no-store', 'x-content-type-options': 'nosniff' });
      res.end(req.method === 'HEAD' ? undefined : body);
    };
    if (!['GET', 'HEAD'].includes(req.method)) { send(405); return; }
    if (!req.url.startsWith('/') || req.url.startsWith('//') || req.url.includes('\\')
      || [...req.url].some((char) => char.charCodeAt(0) <= 32) || req.url.length > 8192) { send(400); return; }
    let target;
    try {
      target = new URL(req.url, backend);
      const path = decodeURIComponent(target.pathname);
      if (path.split('/').some((part) => part.startsWith('.')) || /^\/(?:react|test|node_modules)(?:\/|$)/.test(path) || /\.(?:md|json|mjs|jsx)$/.test(path)) { send(404); return; }
      if (target.origin !== backend.origin) { send(400); return; }
    } catch { send(400); return; }
    if (active >= 32) { send(503); return; }
    active += 1;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeout);
    res.on('close', () => controller.abort());
    try {
      // Only this exact generated public bundle is read from disk. Never serve the repo.
      if (target.pathname === '/scripts/react-islands.js') {
        send(200, await readFile(new URL('../scripts/react-islands.js', import.meta.url)), 'text/javascript; charset=utf-8');
        return;
      }
      const headers = { 'accept-encoding': 'identity' };
      if (forwardedHost) headers['x-forwarded-host'] = forwardedHost;
      const response = await fetch(target, { headers, redirect: 'manual', signal: controller.signal });
      if (response.status >= 300 && response.status < 400) { await response.body?.cancel(); send(502, 'Upstream redirect not supported'); return; }
      const chunks = [];
      let size = 0;
      for await (const chunk of response.body || []) {
        size += chunk.length;
        if (size > maxBytes) { controller.abort(); throw new Error('Response too large'); }
        chunks.push(chunk);
      }
      let body = Buffer.concat(chunks);
      const type = response.headers.get('content-type') || 'application/octet-stream';
      if (/^text\/html(?:;|$)/i.test(type) && !target.pathname.endsWith('.plain.html') && /<!doctype\s+html|<html[\s>]/i.test(body.toString('utf8'))) {
        body = transformHTML(body.toString('utf8'));
        // Deliberately replace upstream nonce policies; bundles are same-origin modules.
        res.setHeader('content-security-policy', "script-src 'self'; base-uri 'self'; object-src 'none'");
        send(response.status, body, 'text/html; charset=utf-8');
      } else send(response.status, body, type);
    } catch { if (!res.headersSent) send(502, 'Upstream unavailable'); else res.destroy(); } finally { clearTimeout(timer); active -= 1; }
  });
  server.requestTimeout = 15000;
  server.headersTimeout = 10000;
  server.keepAliveTimeout = 5000;
  return server;
}
