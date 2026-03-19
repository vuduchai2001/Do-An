/**
 * Repository interfaces - contracts for data access operations.
 */
import type {
  AccountId,
  ProviderId,
  ModelId,
  SessionId,
  RoutingRuleId,
  UsageEventId,
  QuotaStateId,
} from '../../core/domain/ids.js';
import type { UsageAggregate } from './records.js';
import type {
  Account,
  AccountCreateInput,
  AccountUpdateInput,
} from '../../core/domain/entities/account.js';
import type {
  Provider,
  ProviderCreateInput,
  ProviderUpdateInput,
} from '../../core/domain/entities/provider.js';
import type {
  OAuthSession,
  OAuthSessionCreateInput,
} from '../../core/domain/entities/oauth-session.js';
import type {
  RoutingRule,
  RoutingRuleCreateInput,
  RoutingRuleUpdateInput,
} from '../../core/domain/entities/routing-rule.js';
import type { QuotaState, QuotaStateCreateInput } from '../../core/domain/entities/quota-state.js';
import type { UsageEvent, UsageEventCreateInput } from '../../core/domain/entities/usage-event.js';

// === Account Repository ===
export interface AccountRepository {
  findById(id: AccountId): Promise<Account | null>;
  findByProvider(providerId: ProviderId): Promise<Account[]>;
  findByStatus(status: Account['status']): Promise<Account[]>;
  findAll(): Promise<Account[]>;

  create(input: AccountCreateInput): Promise<Account>;
  update(id: AccountId, input: AccountUpdateInput): Promise<Account>;
  delete(id: AccountId): Promise<void>;
}

// === Provider Repository ===
export interface ProviderRepository {
  findById(id: ProviderId): Promise<Provider | null>;
  findByType(type: Provider['type']): Promise<Provider[]>;
  findByStatus(status: Provider['status']): Promise<Provider[]>;
  findAll(): Promise<Provider[]>;

  create(input: ProviderCreateInput): Promise<Provider>;
  update(id: ProviderId, input: ProviderUpdateInput): Promise<Provider>;
  delete(id: ProviderId): Promise<void>;
}

// === OAuth Session Repository ===
export interface OAuthSessionRepository {
  findById(id: SessionId): Promise<OAuthSession | null>;
  findByState(state: string): Promise<OAuthSession | null>;
  findByProvider(providerId: ProviderId, status?: OAuthSession['status']): Promise<OAuthSession[]>;
  findExpired(): Promise<OAuthSession[]>;

  create(input: OAuthSessionCreateInput): Promise<OAuthSession>;
  update(id: SessionId, updates: Partial<OAuthSession>): Promise<OAuthSession>;
  delete(id: SessionId): Promise<void>;
  deleteExpired(): Promise<number>;
}

// === Routing Rule Repository ===
export interface RoutingRuleRepository {
  findById(id: RoutingRuleId): Promise<RoutingRule | null>;
  findAll(): Promise<RoutingRule[]>;
  findByProvider(providerId: ProviderId): Promise<RoutingRule[]>;
  findByModelPattern(modelId: ModelId): Promise<RoutingRule[]>;
  findEnabled(): Promise<RoutingRule[]>;

  create(input: RoutingRuleCreateInput): Promise<RoutingRule>;
  update(id: RoutingRuleId, input: RoutingRuleUpdateInput): Promise<RoutingRule>;
  delete(id: RoutingRuleId): Promise<void>;
}

// === Quota State Repository ===
export interface QuotaStateRepository {
  findById(id: QuotaStateId): Promise<QuotaState | null>;
  findByAccount(accountId: AccountId): Promise<QuotaState[]>;
  findByAccountAndModel(accountId: AccountId, modelId: ModelId): Promise<QuotaState | null>;
  findExhausted(): Promise<QuotaState[]>;
  findInCooldown(): Promise<QuotaState[]>;

  create(input: QuotaStateCreateInput): Promise<QuotaState>;
  update(id: QuotaStateId, updates: Partial<QuotaState>): Promise<QuotaState>;
  delete(id: QuotaStateId): Promise<void>;
  deleteByAccount(accountId: AccountId): Promise<void>;
}

// === Usage Event Repository ===
export interface UsageEventRepository {
  findById(id: UsageEventId): Promise<UsageEvent | null>;
  findByAccount(
    accountId: AccountId,
    options?: {
      since?: Date;
      until?: Date;
      limit?: number;
      offset?: number;
    },
  ): Promise<UsageEvent[]>;
  findByProvider(
    providerId: ProviderId,
    options?: {
      since?: Date;
      limit?: number;
    },
  ): Promise<UsageEvent[]>;

  create(input: UsageEventCreateInput): Promise<UsageEvent>;
  update(id: UsageEventId, updates: Partial<UsageEvent>): Promise<UsageEvent>;

  aggregate(accountId: AccountId, periodStart: Date, periodEnd: Date): Promise<UsageAggregate>;
  countByAccount(accountId: AccountId, since?: Date): Promise<number>;
}

// === Unified repository interface for dependency injection ===
export interface PersistenceRepositories {
  accounts: AccountRepository;
  providers: ProviderRepository;
  oauthSessions: OAuthSessionRepository;
  routingRules: RoutingRuleRepository;
  quotaStates: QuotaStateRepository;
  usageEvents: UsageEventRepository;
}
