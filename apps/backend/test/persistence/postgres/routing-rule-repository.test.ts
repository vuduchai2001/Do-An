import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { ModelId, ProviderId } from '../../../src/core/domain/ids.js';
import { PostgresProviderRepository } from '../../../src/modules/persistence/postgres/provider-repository.js';
import { PostgresRoutingRuleRepository } from '../../../src/modules/persistence/postgres/routing-rule-repository.js';
import { applyTestMigrations, createTestPool, resetTestDatabase } from '../../helpers/postgres.js';

const providerId = ProviderId.create('provider-openai');

describe('PostgresRoutingRuleRepository', () => {
  const pool = createTestPool();
  const providerRepository = new PostgresProviderRepository(pool);
  const repository = new PostgresRoutingRuleRepository(pool);

  beforeAll(async () => {
    await applyTestMigrations();
  });

  afterEach(async () => {
    await resetTestDatabase();
  });

  afterAll(async () => {
    await pool.end();
  });

  it('creates routing rules and matches wildcard model patterns', async () => {
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

    await repository.create({
      name: 'GPT wildcard',
      modelPattern: 'gpt-*',
      providerId,
      priority: 100,
    });

    const matches = await repository.findByModelPattern(ModelId.create('gpt-4.1'));

    expect(matches).toHaveLength(1);
    expect(matches[0].name).toBe('GPT wildcard');
  });
});
