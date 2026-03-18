import Fastify from 'fastify';
import type { FastifyInstance } from 'fastify';
import { loadConfig, type AppConfig } from '../core/config/index.js';
import { healthRoutes } from './routes/health.js';

export interface AppBindings {
  config: AppConfig;
}

export async function createServer(configOverride?: Partial<AppConfig>): Promise<FastifyInstance> {
  const config = loadConfig(configOverride);
  
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
  }
}
