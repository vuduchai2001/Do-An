import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { ProviderId } from '../../../src/core/domain/ids.js';
import { PostgresProviderRepository } from '../../../src/modules/persistence/postgres/provider-repository.js';
import { PostgresAccountRepository } from '../../../src/modules/persistence/postgres/account-repository.js';
import { applyTestMigrations, createTestPool, resetTestDatabase } from '../../helpers/postgres.js';

const providerId = ProviderId.create('provider-openai');

describe('PostgresAccountRepository', () => {
  const pool = createTestPool();
  const providerRepository = new PostgresProviderRepository(pool);
  const accountRepository = new PostgresAccountRepository(pool);

  beforeAll(async () => {
    await applyTestMigrations();
  });

  afterEach(async () => {
    await resetTestDatabase();
  });

  afterAll(async () => {
    await pool.end();
  });

  it('creates and finds an account by provider', async () => {
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

    const created = await accountRepository.create({
      providerId,
      credentials: {
        accessToken: 'token-1',
        refreshToken: 'refresh-1',
        scopes: ['models:read'],
      },
      metadata: {
        email: 'user@example.com',
        labels: ['primary'],
      },
    });

    const accounts = await accountRepository.findByProvider(providerId);

    expect(accounts).toHaveLength(1);
    expect(accounts[0].id).toBe(created.id);
    expect(accounts[0].metadata.email).toBe('user@example.com');
    expect(accounts[0].credentials.accessToken).toBe('token-1');
  });
});
