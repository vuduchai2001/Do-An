/**
 * Shared enums and value objects used across domain entities.
 */

// Account status values
export type AccountStatus = 'active' | 'suspended' | 'exhausted' | 'cooldown' | 'disabled';
export const AccountStatusValues = ['active', 'suspended', 'exhausted', 'cooldown', 'disabled'] as const;

// Provider types
export type ProviderType = 'oauth' | 'device' | 'apikey';
export const ProviderTypeValues = ['oauth', 'device', 'apikey'] as const;

// Provider connection status
export type ProviderStatus = 'connected' | 'disconnected' | 'error';
export const ProviderStatusValues = ['connected', 'disconnected', 'error'] as const;

// OAuth session states
export type OAuthSessionStatus = 'pending' | 'completed' | 'expired' | 'cancelled';
export const OAuthSessionStatusValues = ['pending', 'completed', 'expired', 'cancelled'] as const;

// Routing strategies
export type RoutingStrategy = 'round-robin' | 'fill-first';
export const RoutingStrategyValues = ['round-robin', 'fill-first'] as const;

// Routing rule status
export type RoutingRuleStatus = 'enabled' | 'disabled';
export const RoutingRuleStatusValues = ['enabled', 'disabled'] as const;

// Request/Response status
export type RequestStatus = 'pending' | 'processing' | 'completed' | 'failed';
export const RequestStatusValues = ['pending', 'processing', 'completed', 'failed'] as const;

export type ResponseStatus = 'success' | 'error';
export const ResponseStatusValues = ['success', 'error'] as const;

// Usage event status
export type UsageEventStatus = 'success' | 'error' | 'timeout' | 'rate_limited';
export const UsageEventStatusValues = ['success', 'error', 'timeout', 'rate_limited'] as const;

// Quota exhaustion reasons
export type ExhaustionReason = 'rate_limit' | 'quota_exceeded' | 'provider_error' | 'manual';
export const ExhaustionReasonValues = ['rate_limit', 'quota_exceeded', 'provider_error', 'manual'] as const;

// Health status
export type HealthStatus = 'healthy' | 'degraded' | 'unhealthy';
export const HealthStatusValues = ['healthy', 'degraded', 'unhealthy'] as const;
