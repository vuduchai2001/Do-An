import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createServer } from '../../../src/app/server.js';

describe('healthRoutes', () => {
  let app: Awaited<ReturnType<typeof createServer>>;

  beforeEach(async () => {
    app = await createServer();
  });

  afterEach(async () => {
    if (app) {
      await app.close();
    }
  });

  it('returns health payload from GET /health', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/health',
    });

    expect(response.statusCode).toBe(200);

    const payload = response.json() as {
      ok: boolean;
      service: string;
      timestamp: string;
    };

    expect(payload.ok).toBe(true);
    expect(payload.service).toBe('cli-proxy-nodejs');
    expect(typeof payload.timestamp).toBe('string');
  });
});
