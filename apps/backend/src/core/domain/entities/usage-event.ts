/**
 * Usage Event entity - records individual API usage events.
 */
import type { UsageEventId, AccountId, ProviderId, ModelId } from '../ids.js';
import type { UsageEventStatus } from '../enums.js';

export interface UsageEventTokenCounts {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}

export interface UsageEventTiming {
  startedAt: Date;
  completedAt: Date;
  durationMs: number;
  timeToFirstTokenMs?: number;
}

export interface UsageEventRequest {
  modelId: ModelId;
  messageCount: number;
  maxTokens?: number;
  temperature?: number;
  streaming: boolean;
}

export interface UsageEventResponse {
  finishReason?: string;
  httpResponseCode?: number;
  providerRequestId?: string;
}

export interface UsageEvent {
  id: UsageEventId;
  accountId: AccountId;
  providerId: ProviderId;
  
  status: UsageEventStatus;
  
  request: UsageEventRequest;
  response?: UsageEventResponse;
  
  tokens?: UsageEventTokenCounts;
  timing: UsageEventTiming;
  
  errorCode?: string;
  errorMessage?: string;
  
  metadata?: Record<string, unknown>;
  
  createdAt: Date;
}

export interface UsageEventCreateInput {
  accountId: AccountId;
  providerId: ProviderId;
  request: UsageEventRequest;
  timing: UsageEventTiming;
  metadata?: Record<string, unknown>;
}

export interface UsageEventCompleteInput {
  response: UsageEventResponse;
  tokens?: UsageEventTokenCounts;
}

export interface UsageEventFailInput {
  errorCode: string;
  errorMessage: string;
  httpResponseCode?: number;
}
