import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { ModelId, ProviderId } from '../../../src/core/domain/ids.js';
import { PostgresProviderRepository } from '../../../src/modules/persistence/postgres/provider-repository.js';
import { PostgresAccountRepository } from '../../../src/modules/persistence/postgres/account-repository.js';
import { PostgresQuotaStateRepository } from '../../../src/modules/persistence/postgres/quota-state-repository.js';
import { applyTestMigrations, createTestPool, resetTestDatabase } from '../../helpers/postgres.js';

const providerId = ProviderId.create('provider-openai');

describe('PostgresQuotaStateRepository', () => {
  const pool = createTestPool();
  const providerRepository = new PostgresProviderRepository(pool);
  const accountRepository = new PostgresAccountRepository(pool);
  const repository = new PostgresQuotaStateRepository(pool);

  beforeAll(async () => {
    await applyTestMigrations();
  });

  afterEach(async () => {
    await resetTestDatabase();
  });

  afterAll(async () => {
    await pool.end();
  });

  it('creates and finds quota state by account and model', async () => {
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

    const account = await accountRepository.create({
      providerId,
      credentials: { accessToken: 'token-1' },
    });

    const created = await repository.create({
      accountId: account.id,
      modelId: ModelId.create('gpt-4.1'),
      limits: {
        requestsPerMinute: 60,
      },
    });

    const found = await repository.findByAccountAndModel(account.id, ModelId.create('gpt-4.1'));

    expect(found?.id).toBe(created.id);
    expect(found?.limits.requestsPerMinute).toBe(60);
    expect(found?.exhausted).toBe(false);
  });
});
