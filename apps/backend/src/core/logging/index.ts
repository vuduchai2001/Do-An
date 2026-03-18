import type { FastifyBaseLogger } from 'fastify';

export type Logger = FastifyBaseLogger;

export function createLoggerBindings(logger: Logger, bindings: Record<string, unknown>): Logger {
  return logger.child(bindings);
}
