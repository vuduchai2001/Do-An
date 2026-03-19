import type { AccountId, ModelId, ProviderId } from '../../core/domain/index.js';

export interface UsageEvent {
  id: string;
  accountId: AccountId;
  providerId: ProviderId;
  modelId: ModelId;

  promptTokens: number;
  completionTokens: number;

  status: 'success' | 'error';
  errorCode?: string;
  errorMessage?: string;

  durationMs: number;
  timestamp: Date;
}

export interface UsageSummary {
  accountId: AccountId;
  periodStart: Date;
  periodEnd: Date;

  totalRequests: number;
  successCount: number;
  errorCount: number;

  totalPromptTokens: number;
  totalCompletionTokens: number;

  byModel: Map<
    ModelId,
    {
      requests: number;
      promptTokens: number;
      completionTokens: number;
    }
  >;
}

export interface UsageService {
  recordEvent(event: Omit<UsageEvent, 'id' | 'timestamp'>): Promise<UsageEvent>;
  getSummary(accountId: AccountId, periodStart: Date, periodEnd: Date): Promise<UsageSummary>;
  getRecentEvents(accountId: AccountId, limit?: number): Promise<UsageEvent[]>;
}

export interface UsageRepository {
  save(event: UsageEvent): Promise<void>;
  findByAccount(
    accountId: AccountId,
    options?: {
      since?: Date;
      until?: Date;
      limit?: number;
    },
  ): Promise<UsageEvent[]>;
  aggregate(accountId: AccountId, periodStart: Date, periodEnd: Date): Promise<UsageSummary>;
}
