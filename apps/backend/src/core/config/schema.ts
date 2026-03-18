import { z } from 'zod';

export const ServerConfigSchema = z.object({
  port: z.number().int().min(1).max(65535).default(3000),
  host: z.string().default('0.0.0.0'),
});

export const LoggingConfigSchema = z.object({
  level: z.enum(['trace', 'debug', 'info', 'warn', 'error', 'fatal']).default('info'),
  pretty: z.boolean().default(false),
});

export const PostgresConfigSchema = z.object({
  url: z.string().url().default('postgresql://cliproxy:cliproxy@localhost:5432/cliproxy'),
});

export const RedisConfigSchema = z.object({
  url: z.string().url().default('redis://localhost:6379'),
});

export const AppConfigSchema = z.object({
  server: ServerConfigSchema.default({}),
  logging: LoggingConfigSchema.default({}),
  postgres: PostgresConfigSchema.default({}),
  redis: RedisConfigSchema.default({}),
});

export type ServerConfig = z.infer<typeof ServerConfigSchema>;
export type LoggingConfig = z.infer<typeof LoggingConfigSchema>;
export type PostgresConfig = z.infer<typeof PostgresConfigSchema>;
export type RedisConfig = z.infer<typeof RedisConfigSchema>;
export type AppConfig = z.infer<typeof AppConfigSchema>;
