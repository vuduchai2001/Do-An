import type { PersistenceRepositories } from '../repositories.js';
import { InMemoryAccountRepository } from './account-repository.js';
import { InMemoryProviderRepository } from './provider-repository.js';
import { InMemoryOAuthSessionRepository } from './oauth-session-repository.js';
import { InMemoryRoutingRuleRepository } from './routing-rule-repository.js';
import { InMemoryQuotaStateRepository } from './quota-state-repository.js';
import { InMemoryUsageEventRepository } from './usage-event-repository.js';

export function createInMemoryRepositories(): PersistenceRepositories {
  return {
    accounts: new InMemoryAccountRepository(),
    providers: new InMemoryProviderRepository(),
    oauthSessions: new InMemoryOAuthSessionRepository(),
    routingRules: new InMemoryRoutingRuleRepository(),
    quotaStates: new InMemoryQuotaStateRepository(),
    usageEvents: new InMemoryUsageEventRepository(),
  };
}
