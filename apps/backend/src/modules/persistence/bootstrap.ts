import type { AppConfig } from '../../core/config/index.js';
import type { PersistenceRepositories } from './repositories.js';
import { createInMemoryRepositories } from './memory/index.js';
import {
  createPostgresPool,
  PostgresProviderRepository,
  PostgresAccountRepository,
  PostgresOAuthSessionRepository,
  PostgresRoutingRuleRepository,
  PostgresQuotaStateRepository,
  PostgresUsageEventRepository,
} from './postgres/index.js';

export interface PersistenceBootstrapResult {
  readonly repositories: PersistenceRepositories;
  readonly dispose: () => Promise<void>;
}

export async function bootstrapPersistence(config: AppConfig): Promise<PersistenceBootstrapResult> {
  if (config.persistence.mode === 'postgres') {
    const pool = createPostgresPool(config.postgres);

    return {
      repositories: {
        providers: new PostgresProviderRepository(pool),
        accounts: new PostgresAccountRepository(pool),
        oauthSessions: new PostgresOAuthSessionRepository(pool),
        routingRules: new PostgresRoutingRuleRepository(pool),
        quotaStates: new PostgresQuotaStateRepository(pool),
        usageEvents: new PostgresUsageEventRepository(pool),
      },
      dispose: async () => {
        await pool.end();
      },
    };
  }

  return {
    repositories: createInMemoryRepositories(),
    dispose: async () => {},
  };
}
