/**
 * Provider entity - represents an external AI provider.
 */
import type { ProviderId, ModelId } from '../ids.js';
import type { ProviderType, ProviderStatus } from '../enums.js';

export interface ProviderModel {
  id: ModelId;
  alias?: string;
  supportsStreaming: boolean;
  supportsVision: boolean;
  supportsFunctionCalling: boolean;
  maxTokens: number;
  inputCostPer1k?: number;
  outputCostPer1k?: number;
}

export interface ProviderConfig {
  authorizationUrl?: string;
  tokenUrl?: string;
  deviceCodeUrl?: string;
  scopes?: string[];
  apiBaseUrl: string;
  defaultTimeoutMs: number;
  maxRetries: number;
}

export interface Provider {
  id: ProviderId;
  name: string;
  type: ProviderType;
  status: ProviderStatus;
  
  models: ProviderModel[];
  config: ProviderConfig;
  
  createdAt: Date;
  updatedAt: Date;
}

export interface ProviderCreateInput {
  id: ProviderId;
  name: string;
  type: ProviderType;
  models?: ProviderModel[];
  config: ProviderConfig;
}

export interface ProviderUpdateInput {
  name?: string;
  status?: ProviderStatus;
  models?: ProviderModel[];
  config?: Partial<ProviderConfig>;
}
