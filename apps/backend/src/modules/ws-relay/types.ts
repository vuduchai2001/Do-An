import type { AccountId, ProviderId } from '../../core/domain/index.js';

export interface WebSocketSession {
  id: string;
  accountId: AccountId;
  providerId: ProviderId;
  connectedAt: Date;
  lastActivityAt: Date;
}

export interface WebSocketMessage {
  type: string;
  payload: unknown;
  correlationId?: string;
  timestamp: Date;
}

export interface WsRelayService {
  connect(accountId: AccountId, providerId: ProviderId): Promise<WebSocketSession>;
  disconnect(sessionId: string): Promise<void>;
  
  send(sessionId: string, message: WebSocketMessage): Promise<void>;
  subscribe(sessionId: string, handler: (message: WebSocketMessage) => void): () => void;
  
  getActiveSessions(): WebSocketSession[];
  getSession(sessionId: string): WebSocketSession | undefined;
}

export interface WsRelayAdapter {
  readonly providerId: ProviderId;
  
  connect(credentials: unknown): Promise<void>;
  disconnect(): Promise<void>;
  send(message: WebSocketMessage): Promise<void>;
  onMessage(handler: (message: WebSocketMessage) => void): void;
  isConnected(): boolean;
}
