/**
 * In-memory storage implementation for development and testing.
 * Provides a simple key-value store with basic query capabilities.
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
import { AccountId as AccountIdHelper, ProviderId as ProviderIdHelper } from '../../core/domain/ids.js';
import type {
  AccountStatus,
  OAuthSessionStatus,
} from '../../core/domain/enums.js';
import type { Account, AccountCreateInput, AccountUpdateInput } from '../../core/domain/entities/account.js';
import type { Provider, ProviderCreateInput, ProviderUpdateInput } from '../../core/domain/entities/provider.js';
import type { OAuthSession, OAuthSessionCreateInput } from '../../core/domain/entities/oauth-session.js';
import type { RoutingRule, RoutingRuleCreateInput, RoutingRuleUpdateInput } from '../../core/domain/entities/routing-rule.js';
import type { QuotaState, QuotaStateCreateInput } from '../../core/domain/entities/quota-state.js';
import type { UsageEvent, UsageEventCreateInput } from '../../core/domain/entities/usage-event.js';
import type {
  AccountRepository,
  ProviderRepository,
  OAuthSessionRepository,
  RoutingRuleRepository,
  QuotaStateRepository,
  UsageEventRepository,
  PersistenceRepositories,
} from './repositories.js';
import type { UsageAggregate } from './records.js';

// Helper to generate unique IDs
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// === In-Memory Account Repository ===
class InMemoryAccountRepository implements AccountRepository {
  private store: Map<string, Account> = new Map();

  async findById(id: AccountId): Promise<Account | null> {
    return this.store.get(id as string) ?? null;
  }

  async findByProvider(providerId: ProviderId): Promise<Account[]> {
    return Array.from(this.store.values()).filter(a => a.providerId === providerId);
  }

  async findByStatus(status: AccountStatus): Promise<Account[]> {
    return Array.from(this.store.values()).filter(a => a.status === status);
  }

  async findAll(): Promise<Account[]> {
    return Array.from(this.store.values());
  }

  async create(input: AccountCreateInput): Promise<Account> {
    const id = AccountIdHelper.create(generateId());
    const now = new Date();
    const account: Account = {
      id,
      providerId: input.providerId,
      status: 'active',
      credentials: input.credentials,
      metadata: input.metadata ?? {},
      createdAt: now,
      updatedAt: now,
    };
    this.store.set(id as string, account);
    return account;
  }

  async update(id: AccountId, input: AccountUpdateInput): Promise<Account> {
    const existing = this.store.get(id as string);
    if (!existing) {
      throw new Error(`Account not found: ${id}`);
    }
    const updated: Account = {
      ...existing,
      status: input.status ?? existing.status,
      credentials: input.credentials 
        ? { ...existing.credentials, ...input.credentials }
        : existing.credentials,
      metadata: input.metadata
        ? { ...existing.metadata, ...input.metadata }
        : existing.metadata,
      updatedAt: new Date(),
    };
    this.store.set(id as string, updated);
    return updated;
  }

  async delete(id: AccountId): Promise<void> {
    this.store.delete(id as string);
  }
}

// === In-Memory Provider Repository ===
class InMemoryProviderRepository implements ProviderRepository {
  private store: Map<string, Provider> = new Map();

  async findById(id: ProviderId): Promise<Provider | null> {
    return this.store.get(id as string) ?? null;
  }

  async findByType(type: Provider['type']): Promise<Provider[]> {
    return Array.from(this.store.values()).filter(p => p.type === type);
  }

  async findByStatus(status: Provider['status']): Promise<Provider[]> {
    return Array.from(this.store.values()).filter(p => p.status === status);
  }

  async findAll(): Promise<Provider[]> {
    return Array.from(this.store.values());
  }

  async create(input: ProviderCreateInput): Promise<Provider> {
    const now = new Date();
    const provider: Provider = {
      id: input.id,
      name: input.name,
      type: input.type,
      status: 'connected',
      models: input.models ?? [],
      config: input.config,
      createdAt: now,
      updatedAt: now,
    };
    this.store.set(input.id as string, provider);
    return provider;
  }

  async update(id: ProviderId, input: ProviderUpdateInput): Promise<Provider> {
    const existing = this.store.get(id as string);
    if (!existing) {
      throw new Error(`Provider not found: ${id}`);
    }
    const updated: Provider = {
      ...existing,
      name: input.name ?? existing.name,
      status: input.status ?? existing.status,
      models: input.models ?? existing.models,
      config: input.config 
        ? { ...existing.config, ...input.config }
        : existing.config,
      updatedAt: new Date(),
    };
    this.store.set(id as string, updated);
    return updated;
  }

  async delete(id: ProviderId): Promise<void> {
    this.store.delete(id as string);
  }
}

// === In-Memory OAuth Session Repository ===
class InMemoryOAuthSessionRepository implements OAuthSessionRepository {
  private store: Map<string, OAuthSession> = new Map();

  async findById(id: SessionId): Promise<OAuthSession | null> {
    return this.store.get(id as string) ?? null;
  }

  async findByState(state: string): Promise<OAuthSession | null> {
    return Array.from(this.store.values()).find(s => s.state === state) ?? null;
  }

  async findByProvider(providerId: ProviderId, status?: OAuthSessionStatus): Promise<OAuthSession[]> {
    return Array.from(this.store.values()).filter(
      s => s.providerId === providerId && (!status || s.status === status)
    );
  }

  async findExpired(): Promise<OAuthSession[]> {
    const now = new Date();
    return Array.from(this.store.values()).filter(s => s.expiresAt < now);
  }

  async create(input: OAuthSessionCreateInput): Promise<OAuthSession> {
    const id = SessionIdHelper.create(generateId());
    const now = new Date();
    const session: OAuthSession = {
      id,
      providerId: input.providerId,
      status: 'pending',
      state: input.state,
      codeVerifier: input.codeVerifier,
      redirectUri: input.redirectUri,
      createdAt: now,
      expiresAt: new Date(now.getTime() + input.expiresInSeconds * 1000),
    };
    this.store.set(id as string, session);
    return session;
  }

  async update(id: SessionId, updates: Partial<OAuthSession>): Promise<OAuthSession> {
    const existing = this.store.get(id as string);
    if (!existing) {
      throw new Error(`OAuth session not found: ${id}`);
    }
    const updated: OAuthSession = {
      ...existing,
      ...updates,
    };
    this.store.set(id as string, updated);
    return updated;
  }

  async delete(id: SessionId): Promise<void> {
    this.store.delete(id as string);
  }

  async deleteExpired(): Promise<number> {
    const expired = await this.findExpired();
    for (const session of expired) {
      this.store.delete(session.id as string);
    }
    return expired.length;
  }
}

// Helper for SessionId
const SessionIdHelper = {
  create: (id: string) => id as SessionId,
};

// === In-Memory Routing Rule Repository ===
class InMemoryRoutingRuleRepository implements RoutingRuleRepository {
  private store: Map<string, RoutingRule> = new Map();

  async findById(id: RoutingRuleId): Promise<RoutingRule | null> {
    return this.store.get(id as string) ?? null;
  }

  async findAll(): Promise<RoutingRule[]> {
    return Array.from(this.store.values()).sort((a, b) => b.priority - a.priority);
  }

  async findByProvider(providerId: ProviderId): Promise<RoutingRule[]> {
    return Array.from(this.store.values())
      .filter(r => r.providerId === providerId)
      .sort((a, b) => b.priority - a.priority);
  }

  async findByModelPattern(modelId: ModelId): Promise<RoutingRule[]> {
    // Simple pattern matching - supports wildcards
    const modelStr = modelId as string;
    return Array.from(this.store.values())
      .filter(r => {
        const pattern = r.modelPattern;
        if (pattern === '*') return true;
        if (pattern.endsWith('*')) {
          return modelStr.startsWith(pattern.slice(0, -1));
        }
        return modelStr === pattern;
      })
      .sort((a, b) => b.priority - a.priority);
  }

  async findEnabled(): Promise<RoutingRule[]> {
    return Array.from(this.store.values())
      .filter(r => r.status === 'enabled')
      .sort((a, b) => b.priority - a.priority);
  }

  async create(input: RoutingRuleCreateInput): Promise<RoutingRule> {
    const id = RoutingRuleIdHelper.create(generateId());
    const now = new Date();
    const rule: RoutingRule = {
      id,
      name: input.name,
      description: input.description,
      status: 'enabled',
      modelPattern: input.modelPattern,
      providerId: input.providerId,
      priority: input.priority,
      strategy: input.strategy ?? 'round-robin',
      constraints: input.constraints,
      createdAt: now,
      updatedAt: now,
    };
    this.store.set(id as string, rule);
    return rule;
  }

  async update(id: RoutingRuleId, input: RoutingRuleUpdateInput): Promise<RoutingRule> {
    const existing = this.store.get(id as string);
    if (!existing) {
      throw new Error(`Routing rule not found: ${id}`);
    }
    const updated: RoutingRule = {
      ...existing,
      ...input,
      updatedAt: new Date(),
    };
    this.store.set(id as string, updated);
    return updated;
  }

  async delete(id: RoutingRuleId): Promise<void> {
    this.store.delete(id as string);
  }
}

const RoutingRuleIdHelper = {
  create: (id: string) => id as RoutingRuleId,
};

// === In-Memory Quota State Repository ===
class InMemoryQuotaStateRepository implements QuotaStateRepository {
  private store: Map<string, QuotaState> = new Map();
  private keyFor = (accountId: AccountId, modelId: ModelId) => `${accountId}:${modelId}`;

  async findById(id: QuotaStateId): Promise<QuotaState | null> {
    return Array.from(this.store.values()).find(q => q.id === id) ?? null;
  }

  async findByAccount(accountId: AccountId): Promise<QuotaState[]> {
    return Array.from(this.store.values()).filter(q => q.accountId === accountId);
  }

  async findByAccountAndModel(accountId: AccountId, modelId: ModelId): Promise<QuotaState | null> {
    return this.store.get(this.keyFor(accountId, modelId)) ?? null;
  }

  async findExhausted(): Promise<QuotaState[]> {
    return Array.from(this.store.values()).filter(q => q.exhausted);
  }

  async findInCooldown(): Promise<QuotaState[]> {
    const now = new Date();
    return Array.from(this.store.values()).filter(
      q => q.cooldownUntil && q.cooldownUntil > now
    );
  }

  async create(input: QuotaStateCreateInput): Promise<QuotaState> {
    const id = QuotaStateIdHelper.create(generateId());
    const now = new Date();
    const state: QuotaState = {
      id,
      accountId: input.accountId,
      modelId: input.modelId,
      exhausted: false,
      limits: input.limits ?? {},
      usage: {
        requestsInMinute: 0,
        requestsInHour: 0,
        requestsInDay: 0,
        tokensInMinute: 0,
        tokensInDay: 0,
      },
      lastCheckedAt: now,
      createdAt: now,
      updatedAt: now,
    };
    this.store.set(this.keyFor(input.accountId, input.modelId), state);
    return state;
  }

  async update(id: QuotaStateId, updates: Partial<QuotaState>): Promise<QuotaState> {
    const existing = Array.from(this.store.values()).find(q => q.id === id);
    if (!existing) {
      throw new Error(`Quota state not found: ${id}`);
    }
    const updated: QuotaState = {
      ...existing,
      ...updates,
      updatedAt: new Date(),
    };
    this.store.set(this.keyFor(existing.accountId, existing.modelId), updated);
    return updated;
  }

  async delete(id: QuotaStateId): Promise<void> {
    const existing = Array.from(this.store.values()).find(q => q.id === id);
    if (existing) {
      this.store.delete(this.keyFor(existing.accountId, existing.modelId));
    }
  }

  async deleteByAccount(accountId: AccountId): Promise<void> {
    for (const [key, state] of this.store.entries()) {
      if (state.accountId === accountId) {
        this.store.delete(key);
      }
    }
  }
}

const QuotaStateIdHelper = {
  create: (id: string) => id as QuotaStateId,
};

// === In-Memory Usage Event Repository ===
class InMemoryUsageEventRepository implements UsageEventRepository {
  private store: Map<string, UsageEvent> = new Map();

  async findById(id: UsageEventId): Promise<UsageEvent | null> {
    return this.store.get(id as string) ?? null;
  }

  async findByAccount(accountId: AccountId, options?: {
    since?: Date;
    until?: Date;
    limit?: number;
    offset?: number;
  }): Promise<UsageEvent[]> {
    let events = Array.from(this.store.values())
      .filter(e => e.accountId === accountId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    
    if (options?.since) {
      events = events.filter(e => e.createdAt >= options.since!);
    }
    if (options?.until) {
      events = events.filter(e => e.createdAt <= options.until!);
    }
    
    const offset = options?.offset ?? 0;
    const limit = options?.limit ?? events.length;
    return events.slice(offset, offset + limit);
  }

  async findByProvider(providerId: ProviderId, options?: {
    since?: Date;
    limit?: number;
  }): Promise<UsageEvent[]> {
    let events = Array.from(this.store.values())
      .filter(e => e.providerId === providerId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    
    if (options?.since) {
      events = events.filter(e => e.createdAt >= options.since!);
    }
    
    return events.slice(0, options?.limit ?? events.length);
  }

  async create(input: UsageEventCreateInput): Promise<UsageEvent> {
    const id = UsageEventIdHelper.create(generateId());
    const event: UsageEvent = {
      id,
      accountId: input.accountId,
      providerId: input.providerId,
      status: 'success',
      request: input.request,
      timing: input.timing,
      metadata: input.metadata,
      createdAt: new Date(),
    };
    this.store.set(id as string, event);
    return event;
  }

  async update(id: UsageEventId, updates: Partial<UsageEvent>): Promise<UsageEvent> {
    const existing = this.store.get(id as string);
    if (!existing) {
      throw new Error(`Usage event not found: ${id}`);
    }
    const updated: UsageEvent = {
      ...existing,
      ...updates,
    };
    this.store.set(id as string, updated);
    return updated;
  }

  async aggregate(accountId: AccountId, periodStart: Date, periodEnd: Date): Promise<UsageAggregate> {
    const events = await this.findByAccount(accountId, { since: periodStart, until: periodEnd });
    
    return {
      accountId,
      periodStart,
      periodEnd,
      totalRequests: events.length,
      successCount: events.filter(e => e.status === 'success').length,
      errorCount: events.filter(e => e.status !== 'success').length,
      totalPromptTokens: events.reduce((sum, e) => sum + (e.tokens?.promptTokens ?? 0), 0),
      totalCompletionTokens: events.reduce((sum, e) => sum + (e.tokens?.completionTokens ?? 0), 0),
    };
  }

  async countByAccount(accountId: AccountId, since?: Date): Promise<number> {
    let events = Array.from(this.store.values()).filter(e => e.accountId === accountId);
    if (since) {
      events = events.filter(e => e.createdAt >= since);
    }
    return events.length;
  }
}

const UsageEventIdHelper = {
  create: (id: string) => id as UsageEventId,
};

// === Factory function to create all in-memory repositories ===
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

// Re-export class types for testing
export {
  InMemoryAccountRepository,
  InMemoryProviderRepository,
  InMemoryOAuthSessionRepository,
  InMemoryRoutingRuleRepository,
  InMemoryQuotaStateRepository,
  InMemoryUsageEventRepository,
};
