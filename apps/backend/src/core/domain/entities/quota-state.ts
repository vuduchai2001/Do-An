/**
 * Quota State entity - tracks account quota exhaustion and cooldowns.
 */
import type { QuotaStateId, AccountId, ModelId } from '../ids.js';
import type { ExhaustionReason } from '../enums.js';

export interface QuotaLimits {
  requestsPerMinute?: number;
  requestsPerHour?: number;
  requestsPerDay?: number;
  tokensPerMinute?: number;
  tokensPerDay?: number;
}

export interface QuotaUsage {
  requestsInMinute: number;
  requestsInHour: number;
  requestsInDay: number;
  tokensInMinute: number;
  tokensInDay: number;
}

export interface QuotaState {
  id: QuotaStateId;
  accountId: AccountId;
  modelId: ModelId;

  exhausted: boolean;
  exhaustionReason?: ExhaustionReason;
  exhaustionMessage?: string;

  cooldownUntil?: Date;
  cooldownReason?: string;

  limits: QuotaLimits;
  usage: QuotaUsage;

  lastCheckedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface QuotaStateCreateInput {
  accountId: AccountId;
  modelId: ModelId;
  limits?: QuotaLimits;
}

export interface QuotaStateMarkExhaustedInput {
  reason: ExhaustionReason;
  message?: string;
  cooldownDurationMs?: number;
}

export interface QuotaStateUpdateUsageInput {
  requests?: number;
  tokens?: number;
}
