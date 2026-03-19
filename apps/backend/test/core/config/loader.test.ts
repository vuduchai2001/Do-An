import { writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { loadConfig } from '../../../src/core/config/loader.js';

function writeTempConfig(content: string): string {
  const filePath = join(
    tmpdir(),
    `cliproxy-config-${Date.now()}-${Math.random().toString(36).slice(2)}.yaml`,
  );
  writeFileSync(filePath, content);
  return filePath;
}

describe('loadConfig', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('reads config values from YAML when env vars are absent', () => {
    const configPath = writeTempConfig(`server:
  port: 4100
  host: 127.0.0.1
logging:
  level: warn
  pretty: true
postgres:
  url: postgresql://yaml:yaml@localhost:5432/yaml_db
redis:
  url: redis://localhost:6381
`);

    const config = loadConfig({ configPath });

    expect(config.server.port).toBe(4100);
    expect(config.server.host).toBe('127.0.0.1');
    expect(config.logging.level).toBe('warn');
    expect(config.logging.pretty).toBe(true);
    expect(config.postgres.url).toBe('postgresql://yaml:yaml@localhost:5432/yaml_db');
    expect(config.redis.url).toBe('redis://localhost:6381');
  });

  it('applies schema defaults for values omitted from YAML', () => {
    const configPath = writeTempConfig(`server:
  host: 127.0.0.1
postgres:
  url: postgresql://yaml:yaml@localhost:5432/yaml_db
`);

    const config = loadConfig({ configPath });

    expect(config.server.port).toBe(3000);
    expect(config.server.host).toBe('127.0.0.1');
    expect(config.logging.level).toBe('info');
    expect(config.logging.pretty).toBe(false);
    expect(config.postgres.url).toBe('postgresql://yaml:yaml@localhost:5432/yaml_db');
    expect(config.redis.url).toBe('redis://localhost:6379');
  });

  it('uses env vars as overrides on top of YAML config', () => {
    const configPath = writeTempConfig(`server:
  port: 4100
  host: 127.0.0.1
logging:
  level: warn
  pretty: false
postgres:
  url: postgresql://yaml:yaml@localhost:5432/yaml_db
redis:
  url: redis://localhost:6381
`);

    vi.stubEnv('PORT', '4310');
    vi.stubEnv('LOG_LEVEL', 'debug');
    vi.stubEnv('LOG_PRETTY', 'true');
    vi.stubEnv('DATABASE_URL', 'postgresql://local:test@localhost:5432/testdb');
    vi.stubEnv('REDIS_URL', 'redis://localhost:6380');

    const config = loadConfig({ configPath });

    expect(config.server.port).toBe(4310);
    expect(config.server.host).toBe('127.0.0.1');
    expect(config.logging.level).toBe('debug');
    expect(config.logging.pretty).toBe(true);
    expect(config.postgres.url).toBe('postgresql://local:test@localhost:5432/testdb');
    expect(config.redis.url).toBe('redis://localhost:6380');
  });

  it('uses explicit overrides above YAML and env', () => {
    const configPath = writeTempConfig(`server:
  port: 4100
  host: 127.0.0.1
logging:
  level: info
  pretty: false
postgres:
  url: postgresql://yaml:yaml@localhost:5432/yaml_db
redis:
  url: redis://localhost:6381
`);

    vi.stubEnv('PORT', '4310');

    const config = loadConfig({
      configPath,
      overrides: {
        server: {
          port: 4500,
        },
        logging: {
          level: 'error',
        },
      },
    });

    expect(config.server.port).toBe(4500);
    expect(config.server.host).toBe('127.0.0.1');
    expect(config.logging.level).toBe('error');
    expect(config.logging.pretty).toBe(false);
  });
});
