import { AppConfigSchema, type AppConfig } from './schema.js';

export function loadConfig(overrides?: Partial<AppConfig>): AppConfig {
  const envConfig = {
    server: {
      port: process.env.PORT ? Number(process.env.PORT) : undefined,
      host: process.env.HOST,
    },
    logging: {
      level: process.env.LOG_LEVEL as AppConfig['logging']['level'] | undefined,
      pretty: process.env.LOG_PRETTY === 'true',
    },
  };

  return AppConfigSchema.parse({
    server: { ...envConfig.server, ...overrides?.server },
    logging: { ...envConfig.logging, ...overrides?.logging },
  });
}
