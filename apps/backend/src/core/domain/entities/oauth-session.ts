/**
 * OAuth Session entity - tracks OAuth authentication flows.
 */
import type { SessionId, AccountId, ProviderId } from '../ids.js';
import type { OAuthSessionStatus } from '../enums.js';

export interface OAuthSessionTokens {
  accessToken: string;
  refreshToken?: string;
  expiresIn?: number;
  tokenType: string;
  scopes?: string[];
}

export interface OAuthSession {
  id: SessionId;
  providerId: ProviderId;
  status: OAuthSessionStatus;

  state: string;
  codeVerifier?: string;
  redirectUri?: string;

  tokens?: OAuthSessionTokens;
  accountId?: AccountId;
  errorMessage?: string;

  createdAt: Date;
  expiresAt: Date;
  completedAt?: Date;
}

export interface OAuthSessionCreateInput {
  providerId: ProviderId;
  state: string;
  codeVerifier?: string;
  redirectUri?: string;
  expiresInSeconds: number;
}

export interface OAuthSessionCompleteInput {
  tokens: OAuthSessionTokens;
  accountId: AccountId;
}

export interface OAuthSessionFailInput {
  errorMessage: string;
}
