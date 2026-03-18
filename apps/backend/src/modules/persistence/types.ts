/**
 * Legacy persistence types - re-exported from new modules for backward compatibility.
 * New code should import from records.js and repositories.js
 */

// Re-export ID types for legacy consumers
export type { AccountId, ProviderId, ModelId } from '../../core/domain/ids.js';

// Re-export record types
export type {
  AccountRecord,
  ProviderRecord,
  OAuthSessionRecord,
  RoutingRuleRecord,
  QuotaStateRecord,
  UsageEventRecord,
  UsageAggregate,
} from './records.js';

// Re-export repository interfaces
export type {
  AccountRepository,
  ProviderRepository,
  OAuthSessionRepository,
  RoutingRuleRepository,
  QuotaStateRepository,
  UsageEventRepository,
  PersistenceRepositories,
} from './repositories.js';

// Re-export factory function
export { createInMemoryRepositories } from './memory-store.js';
