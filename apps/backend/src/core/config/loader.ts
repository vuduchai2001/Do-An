import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import YAML from 'yaml';
import { AppConfigSchema, type AppConfig } from './schema.js';

interface AppConfigSource {
  server?: Partial<AppConfig['server']>;
  logging?: Partial<AppConfig['logging']>;
  persistence?: Partial<AppConfig['persistence']>;
  postgres?: Partial<AppConfig['postgres']>;
  redis?: Partial<AppConfig['redis']>;
}

const CURRENT_DIR = dirname(fileURLToPath(import.meta.url));
const BACKEND_ROOT = resolve(CURRENT_DIR, '../../..');
const DEFAULT_CONFIG_PATH = resolve(BACKEND_ROOT, 'config.yaml');

function readYamlConfig(configPath: string): AppConfigSource {
  if (!existsSync(configPath)) {
    return {};
  }

  const rawConfig = readFileSync(configPath, 'utf8').trim();

  if (!rawConfig) {
    return {};
  }

  const parsed = YAML.parse(rawConfig) as AppConfigSource | null;
  return parsed ?? {};
}

function readEnvConfig(): AppConfigSource {
  const serverConfig = (): Partial<AppConfig['server']> | undefined => {
    const server: Partial<AppConfig['server']> = {};

    if (process.env.PORT) {
      server.port = Number(process.env.PORT);
    }

    if (process.env.HOST) {
      server.host = process.env.HOST;
    }

    return Object.keys(server).length > 0 ? server : undefined;
  };

  const loggingConfig = (): Partial<AppConfig['logging']> | undefined => {
    const logging: Partial<AppConfig['logging']> = {};

    if (process.env.LOG_LEVEL) {
      logging.level = process.env.LOG_LEVEL as AppConfig['logging']['level'];
    }

    if (process.env.LOG_PRETTY) {
      logging.pretty = process.env.LOG_PRETTY === 'true';
    }

    return Object.keys(logging).length > 0 ? logging : undefined;
  };

  const persistenceConfig = (): Partial<AppConfig['persistence']> | undefined => {
    const persistence: Partial<AppConfig['persistence']> = {};

    if (process.env.PERSISTENCE_MODE) {
      persistence.mode = process.env.PERSISTENCE_MODE as AppConfig['persistence']['mode'];
    }

    return Object.keys(persistence).length > 0 ? persistence : undefined;
  };

  const envConfig: AppConfigSource = {};

  const server = serverConfig();
  const logging = loggingConfig();
  const persistence = persistenceConfig();

  if (server) {
    envConfig.server = server;
  }

  if (logging) {
    envConfig.logging = logging;
  }

  if (persistence) {
    envConfig.persistence = persistence;
  }

  if (process.env.DATABASE_URL) {
    envConfig.postgres = {
      url: process.env.DATABASE_URL,
    };
  }

  if (process.env.REDIS_URL) {
    envConfig.redis = {
      url: process.env.REDIS_URL,
    };
  }

  return envConfig;
}

export interface LoadConfigOptions {
  readonly configPath?: string;
  readonly overrides?: AppConfigSource;
}

function mergeConfig(
  yamlConfig: AppConfigSource,
  envConfig: AppConfigSource,
  overrides?: AppConfigSource,
): AppConfig {
  return AppConfigSchema.parse({
    server: {
      ...yamlConfig.server,
      ...envConfig.server,
      ...overrides?.server,
    },
    logging: {
      ...yamlConfig.logging,
      ...envConfig.logging,
      ...overrides?.logging,
    },
    persistence: {
      ...yamlConfig.persistence,
      ...envConfig.persistence,
      ...overrides?.persistence,
    },
    postgres: {
      ...yamlConfig.postgres,
      ...envConfig.postgres,
      ...overrides?.postgres,
    },
    redis: {
      ...yamlConfig.redis,
      ...envConfig.redis,
      ...overrides?.redis,
    },
  });
}

export function loadConfig(options?: Partial<AppConfig> | LoadConfigOptions): AppConfig {
  const normalizedOptions =
    options && ('configPath' in options || 'overrides' in options)
      ? options
      : { overrides: options as AppConfigSource | undefined };

  const configPath = normalizedOptions.configPath ?? process.env.CONFIG_PATH ?? DEFAULT_CONFIG_PATH;
  const yamlConfig = readYamlConfig(configPath);
  const envConfig = readEnvConfig();

  return mergeConfig(yamlConfig, envConfig, normalizedOptions.overrides);
}
