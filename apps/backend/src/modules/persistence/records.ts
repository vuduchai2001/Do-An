/**
 * Persistence record types - database/storage representation of domain entities.
 * These are separated from domain entities to allow different storage schemas.
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
import type {
  AccountStatus,
  ProviderType,
  ProviderStatus,
  OAuthSessionStatus,
  RoutingRuleStatus,
  RoutingStrategy,
  UsageEventStatus,
  ExhaustionReason,
} from '../../core/domain/enums.js';

// Account persistence record
export interface AccountRecord {
  id: AccountId;
  providerId: ProviderId;
  status: AccountStatus;
  
  accessToken: string;
  refreshToken?: string;
  tokenExpiresAt?: Date;
  tokenScopes?: string[];
  
  email?: string;
  name?: string;
  organizationId?: string;
  labels?: string[];
  customAttributes?: string; // JSON string
  
  createdAt: Date;
  updatedAt: Date;
  lastUsedAt?: Date;
  lastRefreshAt?: Date;
}

// Provider persistence record
export interface ProviderRecord {
  id: ProviderId;
  name: string;
  type: ProviderType;
  status: ProviderStatus;
  
  models: string; // JSON string of ProviderModel[]
  
  authorizationUrl?: string;
  tokenUrl?: string;
  deviceCodeUrl?: string;
  scopes?: string; // JSON string
  apiBaseUrl: string;
  defaultTimeoutMs: number;
  maxRetries: number;
  
  createdAt: Date;
  updatedAt: Date;
}

// OAuth Session persistence record
export interface OAuthSessionRecord {
  id: SessionId;
  providerId: ProviderId;
  status: OAuthSessionStatus;
  
  state: string;
  codeVerifier?: string;
  redirectUri?: string;
  
  accessToken?: string;
  refreshToken?: string;
  expiresIn?: number;
  tokenType?: string;
  tokenScopes?: string; // JSON string
  
  accountId?: AccountId;
  errorMessage?: string;
  
  createdAt: Date;
  expiresAt: Date;
  completedAt?: Date;
}

// Routing Rule persistence record
export interface RoutingRuleRecord {
  id: RoutingRuleId;
  name: string;
  description?: string;
  status: RoutingRuleStatus;
  
  modelPattern: string;
  providerId: ProviderId;
  priority: number;
  strategy: RoutingStrategy;
  
  constraints?: string; // JSON string of RoutingRuleConstraints
  
  createdAt: Date;
  updatedAt: Date;
}

// Quota State persistence record
export interface QuotaStateRecord {
  id: QuotaStateId;
  accountId: AccountId;
  modelId: ModelId;
  
  exhausted: boolean;
  exhaustionReason?: ExhaustionReason;
  exhaustionMessage?: string;
  
  cooldownUntil?: Date;
  cooldownReason?: string;
  
  limitsRequestsPerMinute?: number;
  limitsRequestsPerHour?: number;
  limitsRequestsPerDay?: number;
  limitsTokensPerMinute?: number;
  limitsTokensPerDay?: number;
  
  usageRequestsInMinute: number;
  usageRequestsInHour: number;
  usageRequestsInDay: number;
  usageTokensInMinute: number;
  usageTokensInDay: number;
  
  lastCheckedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Usage Event persistence record
export interface UsageEventRecord {
  id: UsageEventId;
  accountId: AccountId;
  providerId: ProviderId;
  
  status: UsageEventStatus;
  
  requestModelId: ModelId;
  requestMessageCount: number;
  requestMaxTokens?: number;
  requestTemperature?: number;
  requestStreaming: boolean;
  
  responseFinishReason?: string;
  responseHttpCode?: number;
  responseProviderRequestId?: string;
  
  tokensPrompt?: number;
  tokensCompletion?: number;
  tokensTotal?: number;
  
  timingStartedAt: Date;
  timingCompletedAt: Date;
  timingDurationMs: number;
  timingTimeToFirstTokenMs?: number;
  
  errorCode?: string;
  errorMessage?: string;
  
  metadata?: string; // JSON string
  
  createdAt: Date;
}

// Aggregate types for queries
export interface UsageAggregate {
  accountId: AccountId;
  periodStart: Date;
  periodEnd: Date;
  totalRequests: number;
  successCount: number;
  errorCount: number;
  totalPromptTokens: number;
  totalCompletionTokens: number;
}
