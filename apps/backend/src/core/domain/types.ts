/**
 * Legacy domain types - re-exported from new modules for backward compatibility.
 * New code should import directly from ids.js, enums.js, or entities/*.js
 */

// Re-export ID types
export type { 
  AccountId, 
  ProviderId, 
  ModelId, 
  SessionId, 
  RoutingRuleId, 
  UsageEventId, 
  QuotaStateId 
} from './ids.js';

// Re-export enums
export type {
  AccountStatus,
  ProviderType,
  ProviderStatus,
  OAuthSessionStatus,
  RoutingStrategy,
  RoutingRuleStatus,
  RequestStatus,
  ResponseStatus,
  UsageEventStatus,
  ExhaustionReason,
  HealthStatus,
} from './enums.js';

// Re-export Account entity types
export type {
  Account,
  AccountCredentials,
  AccountMetadata,
  AccountCreateInput,
  AccountUpdateInput,
} from './entities/account.js';

// Re-export Provider entity types
export type {
  Provider,
  ProviderModel,
  ProviderConfig,
  ProviderCreateInput,
  ProviderUpdateInput,
} from './entities/provider.js';

// Re-export OAuth Session entity types
export type {
  OAuthSession,
  OAuthSessionTokens,
  OAuthSessionCreateInput,
  OAuthSessionCompleteInput,
  OAuthSessionFailInput,
} from './entities/oauth-session.js';

// Re-export Routing Rule entity types
export type {
  RoutingRule,
  RoutingRuleConstraints,
  RoutingRuleCreateInput,
  RoutingRuleUpdateInput,
} from './entities/routing-rule.js';

// Re-export Quota State entity types
export type {
  QuotaState,
  QuotaLimits,
  QuotaUsage,
  QuotaStateCreateInput,
  QuotaStateMarkExhaustedInput,
  QuotaStateUpdateUsageInput,
} from './entities/quota-state.js';

// Re-export Usage Event entity types
export type {
  UsageEvent,
  UsageEventTokenCounts,
  UsageEventTiming,
  UsageEventRequest,
  UsageEventResponse,
  UsageEventCreateInput,
  UsageEventCompleteInput,
  UsageEventFailInput,
} from './entities/usage-event.js';

// Envelope types for request/response handling
export interface RequestEnvelope<T = unknown> {
  id: string;
  timestamp: Date;
  payload: T;
}

export interface ResponseEnvelope<T = unknown> {
  id: string;
  timestamp: Date;
  status: 'success' | 'error';
  payload: T;
  error?: {
    code: string;
    message: string;
  };
}
