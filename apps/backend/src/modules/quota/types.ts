import type { AccountId, ModelId, QuotaState } from '../../core/domain/index.js';

export interface CooldownEntry {
  accountId: AccountId;
  modelId: ModelId;
  reason: string;
  startedAt: Date;
  recoverAt: Date;
}

export interface QuotaService {
  isExhausted(accountId: AccountId, modelId: ModelId): Promise<boolean>;
  isInCooldown(accountId: AccountId, modelId: ModelId): Promise<boolean>;
  
  markExhausted(accountId: AccountId, modelId: ModelId, reason: string): Promise<void>;
  startCooldown(
    accountId: AccountId,
    modelId: ModelId,
    durationMs: number,
    reason: string
  ): Promise<void>;
  
  clearExhausted(accountId: AccountId, modelId: ModelId): Promise<void>;
  checkAndClearExpiredCooldowns(): Promise<number>;
  
  getQuotaState(accountId: AccountId): Promise<QuotaState[]>;
}

export interface QuotaRepository {
  findExhausted(accountId: AccountId, modelId: ModelId): Promise<{ exhausted: boolean; reason?: string } | null>;
  findCooldown(accountId: AccountId, modelId: ModelId): Promise<CooldownEntry | null>;
  
  setExhausted(accountId: AccountId, modelId: ModelId, reason: string): Promise<void>;
  setCooldown(entry: CooldownEntry): Promise<void>;
  
  clearExhausted(accountId: AccountId, modelId: ModelId): Promise<void>;
  clearCooldown(accountId: AccountId, modelId: ModelId): Promise<void>;
  
  findExpiredCooldowns(): Promise<CooldownEntry[]>;
}
