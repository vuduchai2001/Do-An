import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { ProviderId } from '../../../src/core/domain/ids.js';
import { PostgresProviderRepository } from '../../../src/modules/persistence/postgres/provider-repository.js';
import { PostgresOAuthSessionRepository } from '../../../src/modules/persistence/postgres/oauth-session-repository.js';
import { applyTestMigrations, createTestPool, resetTestDatabase } from '../../helpers/postgres.js';

const providerId = ProviderId.create('provider-openai');

describe('PostgresOAuthSessionRepository', () => {
  const pool = createTestPool();
  const providerRepository = new PostgresProviderRepository(pool);
  const sessionRepository = new PostgresOAuthSessionRepository(pool);

  beforeAll(async () => {
    await applyTestMigrations();
  });

  afterEach(async () => {
    await resetTestDatabase();
  });

  afterAll(async () => {
    await pool.end();
  });

  it('creates and finds an oauth session by state', async () => {
    await providerRepository.create({
      id: providerId,
      name: 'OpenAI',
      type: 'oauth',
      config: {
        apiBaseUrl: 'https://api.openai.com',
        defaultTimeoutMs: 30000,
        maxRetries: 2,
      },
    });

    const created = await sessionRepository.create({
      providerId,
      state: 'state-123',
      codeVerifier: 'verifier-123',
      redirectUri: 'http://localhost/callback',
      expiresInSeconds: 300,
    });

    const found = await sessionRepository.findByState('state-123');

    expect(found?.id).toBe(created.id);
    expect(found?.status).toBe('pending');
    expect(found?.providerId).toBe(providerId);
  });
});
