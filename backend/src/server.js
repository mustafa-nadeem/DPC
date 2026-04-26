import { createApp } from './app.js';
import { env } from './config/env.js';
import { prisma } from './db.js';

const app = createApp();

const server = app.listen(env.port, () => {
  console.log(`DPC backend listening on http://localhost:${env.port}`);
});

const shutdown = async () => {
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
