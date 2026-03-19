import type { FastifyPluginAsync } from 'fastify';

export interface GatewayRequest {
  model: string;
  messages: Array<{ role: string; content: string }>;
  stream?: boolean;
  temperature?: number;
  max_tokens?: number;
}

export interface GatewayResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message?: { role: string; content: string };
    delta?: { role?: string; content?: string };
    finish_reason: string | null;
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface GatewayService {
  handleChatCompletion(request: GatewayRequest): Promise<GatewayResponse>;
  handleStreamingChatCompletion(
    request: GatewayRequest,
    onChunk: (chunk: string) => void,
  ): Promise<void>;
}

export const gatewayRoutes: FastifyPluginAsync = async () => {
  // Placeholder - routes will be implemented in Sprint 5
};
