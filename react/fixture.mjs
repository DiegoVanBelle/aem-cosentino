import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';

// Exact manifest, not a generic static file server. Demo only, loopback-bound.
const files = [
  'scripts/aem.js', 'scripts/scripts.js', 'scripts/react-support.js', 'scripts/react-islands.js', 'scripts/delayed.js',
  'styles/styles.css', 'styles/react-tailwind.css', 'styles/lazy-styles.css', 'styles/fonts.css',
  'fonts/roboto-bold.woff2', 'fonts/roboto-condensed-bold.woff2',
  'fonts/roboto-medium.woff2', 'fonts/roboto-regular.woff2',
  'blocks/react-teaser/react-teaser.js', 'blocks/react-teaser/react-teaser.css',
  'blocks/react-button/react-button.js', 'blocks/react-button/react-button.css',
  'blocks/quote/quote.js', 'blocks/quote/quote.css', 'blocks/fragment/fragment.js',
  'blocks/fragment/fragment.css', 'blocks/header/header.js', 'blocks/header/header.css',
  'blocks/footer/footer.js', 'blocks/footer/footer.css',
];
export function createFixture() {
  return createServer(async (req, res) => {
    const path = new URL(req.url, 'http://localhost').pathname;
    try {
      if (path === '/') {
        const html = await readFile(new URL('./fixture.html', import.meta.url), 'utf8');
        const head = await readFile(new URL('../head.html', import.meta.url), 'utf8');
        res.setHeader('content-type', 'text/html; charset=utf-8');
        res.end(html.replace('<!--HEAD-->', head));
      } else if (['/nav.plain.html', '/footer.plain.html'].includes(path)) {
        res.setHeader('content-type', 'text/html'); res.end('<div><p>Offline demo</p></div>');
      } else if (files.includes(path.slice(1))) {
        res.setHeader('content-type', path.endsWith('.css') ? 'text/css' : 'text/javascript');
        res.end(await readFile(new URL(`../${path.slice(1)}`, import.meta.url)));
      } else { res.writeHead(404); res.end(); }
    } catch { res.writeHead(500); res.end('Fixture unavailable'); }
  });
}
