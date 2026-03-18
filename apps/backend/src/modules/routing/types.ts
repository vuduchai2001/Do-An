import type { AccountId, ModelId, ProviderId, RoutingStrategy } from '../../core/domain/index.js';

export interface AccountHealth {
  accountId: AccountId;
  providerId: ProviderId;
  status: 'healthy' | 'degraded' | 'unhealthy';
  lastSuccessAt?: Date;
  lastFailureAt?: Date;
  consecutiveFailures: number;
}

export interface RoutingContext {
  modelId: ModelId;
  providerId?: ProviderId;
  excludedAccounts?: AccountId[];
}

export interface RoutingDecision {
  accountId: AccountId;
  providerId: ProviderId;
  reason: string;
  alternateAccounts: AccountId[];
}

export interface RoutingService {
  selectAccount(ctx: RoutingContext): Promise<RoutingDecision>;
  reportSuccess(accountId: AccountId, modelId: ModelId): Promise<void>;
  reportFailure(accountId: AccountId, modelId: ModelId, error: Error): Promise<void>;
  
  getAccountHealth(accountId: AccountId): Promise<AccountHealth | null>;
  getHealthyAccounts(providerId: ProviderId): Promise<AccountId[]>;
  
  setStrategy(strategy: RoutingStrategy): void;
  getStrategy(): RoutingStrategy;
}

export interface AccountPool {
  add(accountId: AccountId, providerId: ProviderId): void;
  remove(accountId: AccountId): void;
  getAvailable(modelId: ModelId, providerId?: ProviderId): AccountId[];
  markUnavailable(accountId: AccountId, durationMs: number): void;
}
