import type { ProviderId, ModelId } from '../../core/domain/index.js';
import type { GatewayRequest, GatewayResponse } from '../gateway/types.js';
import type { ProviderRequest, ProviderResponse } from '../providers/types.js';

export interface TranslationContext {
  sourceFormat: 'openai' | 'anthropic' | 'google';
  targetFormat: string;
  providerId: ProviderId;
  modelId: ModelId;
}

export interface Translator<TGateway = GatewayRequest, TProvider = ProviderRequest> {
  readonly sourceFormat: string;
  readonly targetFormat: string;
  
  translateRequest(gatewayRequest: TGateway, ctx: TranslationContext): TProvider;
  translateResponse(providerResponse: ProviderResponse, ctx: TranslationContext): GatewayResponse;
  
  translateStreamChunk?(
    chunk: string,
    ctx: TranslationContext
  ): string | null;
}

export interface TranslatorRegistry {
  register(translator: Translator): void;
  get(sourceFormat: string, targetFormat: string): Translator | undefined;
  getForProvider(providerId: ProviderId): Translator | undefined;
}

export interface TranslationPipeline {
  translateRequest(request: GatewayRequest, ctx: TranslationContext): ProviderRequest;
  translateResponse(response: ProviderResponse, ctx: TranslationContext): GatewayResponse;
}
