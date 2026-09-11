import { build } from 'esbuild';

await build({
  entryPoints: ['react/server.jsx'], outfile: 'react/dist/server.mjs', bundle: true, platform: 'node', format: 'esm', packages: 'external', jsx: 'automatic',
});
await build({
  entryPoints: ['react/client.jsx'],
  outfile: 'scripts/react-islands.js',
  bundle: true,
  platform: 'browser',
  format: 'esm',
  jsx: 'automatic',
  minify: true,
  define: { 'process.env.NODE_ENV': '"production"' },
  legalComments: 'none',
});
