import type { ProviderId, ModelId, AccountId } from '../../core/domain/index.js';

export interface ProviderCapability {
  supportsStreaming: boolean;
  supportsVision: boolean;
  supportsFunctionCalling: boolean;
  maxTokens: number;
}

export interface ProviderModel {
  id: ModelId;
  alias?: string;
  capability: ProviderCapability;
}

export interface ProviderAdapter {
  readonly providerId: ProviderId;
  readonly name: string;
  
  getModels(): ProviderModel[];
  supportsModel(modelId: ModelId): boolean;
  
  execute(
    accountId: AccountId,
    modelId: ModelId,
    request: ProviderRequest
  ): Promise<ProviderResponse>;
  
  executeStream?(
    accountId: AccountId,
    modelId: ModelId,
    request: ProviderRequest,
    onChunk: (chunk: string) => void
  ): Promise<void>;
}

export interface ProviderRequest {
  messages: Array<{ role: string; content: string }>;
  temperature?: number;
  maxTokens?: number;
  metadata?: Record<string, unknown>;
}

export interface ProviderResponse {
  id: string;
  model: string;
  content: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
  };
  finishReason: string;
}

export interface ProviderRegistry {
  register(adapter: ProviderAdapter): void;
  get(providerId: ProviderId): ProviderAdapter | undefined;
  getAll(): ProviderAdapter[];
}
