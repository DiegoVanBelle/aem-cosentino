import { createFixture } from './fixture.mjs';
import { createGateway } from './gateway.mjs';

const fixture = createFixture();
await new Promise((resolve) => fixture.listen(0, '127.0.0.1', resolve));
const origin = `http://127.0.0.1:${fixture.address().port}`;
const gateway = createGateway({ origin });
gateway.listen(Number(process.env.PORT || 3000), '127.0.0.1', () => {
  console.log(`Gateway: http://127.0.0.1:${gateway.address().port}`);
  console.log(`Direct fixture (client rendering): ${origin}`);
});
['SIGINT', 'SIGTERM'].forEach((signal) => process.on(signal, () => {
  gateway.close(); gateway.closeAllConnections(); fixture.close(); fixture.closeAllConnections();
}));
