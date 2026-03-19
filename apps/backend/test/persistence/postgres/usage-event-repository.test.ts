import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { ModelId, ProviderId } from '../../../src/core/domain/ids.js';
import { PostgresProviderRepository } from '../../../src/modules/persistence/postgres/provider-repository.js';
import { PostgresAccountRepository } from '../../../src/modules/persistence/postgres/account-repository.js';
import { PostgresUsageEventRepository } from '../../../src/modules/persistence/postgres/usage-event-repository.js';
import { applyTestMigrations, createTestPool, resetTestDatabase } from '../../helpers/postgres.js';

const providerId = ProviderId.create('provider-openai');

describe('PostgresUsageEventRepository', () => {
  const pool = createTestPool();
  const providerRepository = new PostgresProviderRepository(pool);
  const accountRepository = new PostgresAccountRepository(pool);
  const repository = new PostgresUsageEventRepository(pool);

  beforeAll(async () => {
    await applyTestMigrations();
  });

  afterEach(async () => {
    await resetTestDatabase();
  });

  afterAll(async () => {
    await pool.end();
  });

  it('creates usage event and aggregates by account', async () => {
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

    await repository.create({
      accountId: account.id,
      providerId,
      request: {
        modelId: ModelId.create('gpt-4.1'),
        messageCount: 2,
        streaming: false,
      },
      timing: {
        startedAt: new Date('2026-03-19T00:00:00Z'),
        completedAt: new Date('2026-03-19T00:00:01Z'),
        durationMs: 1000,
      },
    });

    const aggregate = await repository.aggregate(
      account.id,
      new Date('2026-03-18T00:00:00Z'),
      new Date('2026-03-20T00:00:00Z'),
    );

    expect(aggregate.totalRequests).toBe(1);
    expect(aggregate.successCount).toBe(1);
  });
});
