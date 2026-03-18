import { createServer, startServer } from './app/index.js';

const main = async (): Promise<void> => {
  const app = await createServer();
  await startServer(app);
};

main().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
