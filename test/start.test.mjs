import test from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';

test('demo command starts a real gateway with server-rendered HTML', async (t) => {
  assert.ok(existsSync(new URL('../react/demo.mjs', import.meta.url)), 'demo entry exists');
  assert.ok(existsSync(new URL('../react/start.mjs', import.meta.url)), 'production entry exists');
  const child = spawn(process.execPath, ['react/demo.mjs'], { env: { ...process.env, PORT: '0' } });
  t.after(() => child.kill('SIGTERM'));
  const url = await new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('Startup timed out')), 5000);
    child.once('exit', () => { clearTimeout(timer); reject(new Error('Startup failed')); });
    child.stdout.on('data', (chunk) => {
      const match = chunk.toString().match(/Gateway: (http:\/\/[^\s]+)/);
      if (match) { clearTimeout(timer); resolve(match[1]); }
    });
  });
  const response = await fetch(url);
  assert.match(await response.text(), /<h2[^>]*>Surfaces for everyday living<\/h2>/);
  assert.equal((await fetch(`${url}/scripts/react-islands.js`)).status, 200);
});
