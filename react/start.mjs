import { createGateway } from './gateway.mjs';

if (!process.env.AEM_ORIGIN) throw new Error('Set AEM_ORIGIN, or use npm run demo:ssr for the offline demo');
const server = createGateway({ origin: process.env.AEM_ORIGIN, forwardedHost: process.env.PUBLIC_HOST });
server.listen(Number(process.env.PORT || 3000), process.env.HOST || '127.0.0.1', () => {
  console.log(`Gateway listening on port ${server.address().port}`);
});
['SIGINT', 'SIGTERM'].forEach((signal) => process.on(signal, () => {
  server.close(); server.closeAllConnections();
}));
