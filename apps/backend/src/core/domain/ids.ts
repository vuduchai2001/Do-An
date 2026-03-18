/**
 * Branded ID types for type-safe entity identification.
 * These prevent mixing up IDs of different entity types.
 */

declare const brand: unique symbol;

export type Branded<T, B> = T & { readonly [brand]: B };

export type AccountId = Branded<string, 'AccountId'>;
export const AccountId = {
  create: (id: string): AccountId => id as AccountId,
  unsafeCast: (id: string): AccountId => id as AccountId,
};

export type ProviderId = Branded<string, 'ProviderId'>;
export const ProviderId = {
  create: (id: string): ProviderId => id as ProviderId,
  unsafeCast: (id: string): ProviderId => id as ProviderId,
};

export type ModelId = Branded<string, 'ModelId'>;
export const ModelId = {
  create: (id: string): ModelId => id as ModelId,
  unsafeCast: (id: string): ModelId => id as ModelId,
};

export type SessionId = Branded<string, 'SessionId'>;
export const SessionId = {
  create: (id: string): SessionId => id as SessionId,
  unsafeCast: (id: string): SessionId => id as SessionId,
};

export type RoutingRuleId = Branded<string, 'RoutingRuleId'>;
export const RoutingRuleId = {
  create: (id: string): RoutingRuleId => id as RoutingRuleId,
  unsafeCast: (id: string): RoutingRuleId => id as RoutingRuleId,
};

export type UsageEventId = Branded<string, 'UsageEventId'>;
export const UsageEventId = {
  create: (id: string): UsageEventId => id as UsageEventId,
  unsafeCast: (id: string): UsageEventId => id as UsageEventId,
};

export type QuotaStateId = Branded<string, 'QuotaStateId'>;
export const QuotaStateId = {
  create: (id: string): QuotaStateId => id as QuotaStateId,
  unsafeCast: (id: string): QuotaStateId => id as QuotaStateId,
};
