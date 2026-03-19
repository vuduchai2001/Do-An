import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { ProviderId, ModelId } from '../../../src/core/domain/ids.js';
import { PostgresProviderRepository } from '../../../src/modules/persistence/postgres/provider-repository.js';
import { applyTestMigrations, createTestPool, resetTestDatabase } from '../../helpers/postgres.js';

const providerId = ProviderId.create('provider-openai');

describe('PostgresProviderRepository', () => {
  const pool = createTestPool();
  const repository = new PostgresProviderRepository(pool);

  beforeAll(async () => {
    await applyTestMigrations();
  });

  afterEach(async () => {
    await resetTestDatabase();
  });

  afterAll(async () => {
    await pool.end();
  });

  it('creates and finds a provider', async () => {
    const created = await repository.create({
      id: providerId,
      name: 'OpenAI',
      type: 'oauth',
      models: [
        {
          id: ModelId.create('gpt-4.1'),
          supportsStreaming: true,
          supportsVision: true,
          supportsFunctionCalling: true,
          maxTokens: 128000,
        },
      ],
      config: {
        apiBaseUrl: 'https://api.openai.com',
        defaultTimeoutMs: 30000,
        maxRetries: 2,
        scopes: ['models:read'],
      },
    });

    expect(created.id).toBe(providerId);
    expect(created.status).toBe('connected');

    const found = await repository.findById(providerId);
    expect(found?.name).toBe('OpenAI');
    expect(found?.models).toHaveLength(1);
    expect(found?.config.apiBaseUrl).toBe('https://api.openai.com');
  });
});
