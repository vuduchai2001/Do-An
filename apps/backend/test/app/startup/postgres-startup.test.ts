import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createServer } from '../../../src/app/server.js';
import { applyTestMigrations, resetTestDatabase } from '../../helpers/postgres.js';

describe('createServer with postgres persistence mode', () => {
  let app: Awaited<ReturnType<typeof createServer>>;

  beforeEach(async () => {
    await applyTestMigrations();
    await resetTestDatabase();
    app = await createServer({
      persistence: {
        mode: 'postgres',
      },
    });
  });

  afterEach(async () => {
    if (app) {
      await app.close();
    }
  });

  it('boots successfully with postgres mode enabled', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/health',
    });

    expect(response.statusCode).toBe(200);
    expect(app.persistence.repositories.providers).toBeDefined();
    expect(app.persistence.repositories.accounts).toBeDefined();
    expect(app.persistence.repositories.oauthSessions).toBeDefined();
  });
});
