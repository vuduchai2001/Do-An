import Fastify from 'fastify';
import type { FastifyInstance } from 'fastify';
import { loadConfig, type AppConfig } from '../core/config/index.js';
import {
  bootstrapPersistence,
  type PersistenceBootstrapResult,
} from '../modules/persistence/index.js';
import { healthRoutes } from './routes/health.js';

export interface AppBindings {
  config: AppConfig;
  persistence: PersistenceBootstrapResult;
}

export async function createServer(configOverride?: Partial<AppConfig>): Promise<FastifyInstance> {
  const config = loadConfig(configOverride);
  const persistence = await bootstrapPersistence(config);

  const app = Fastify({
    logger: {
      level: config.logging.level,
      transport: config.logging.pretty
        ? { target: 'pino-pretty', options: { colorize: true } }
        : undefined,
    },
  });

  // Bind config to app
  app.decorate('config', config);
  app.decorate('persistence', persistence);

  app.addHook('onClose', async () => {
    await persistence.dispose();
  });

  // Register routes
  await app.register(healthRoutes);

  return app;
}

export async function startServer(app: FastifyInstance): Promise<void> {
  const config = app.config;

  try {
    await app.listen({ port: config.server.port, host: config.server.host });
    app.log.info(`Server listening on ${config.server.host}:${config.server.port}`);
  } catch (error) {
    app.log.error(error);
    throw error;
  }
}

// Extend Fastify types
declare module 'fastify' {
  interface FastifyInstance {
    config: AppConfig;
    persistence: PersistenceBootstrapResult;
  }
}
