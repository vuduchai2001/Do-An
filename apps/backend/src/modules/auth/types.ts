import type { AccountId, ProviderId } from '../../core/domain/index.js';

export interface OAuthSession {
  id: string;
  providerId: ProviderId;
  state: string;
  createdAt: Date;
  expiresAt: Date;
}

export interface AuthCredentials {
  accountId: AccountId;
  providerId: ProviderId;
  accessToken: string;
  refreshToken?: string;
  expiresAt?: Date;
}

export interface AuthService {
  initiateLogin(providerId: ProviderId): Promise<{ authUrl: string; state: string }>;
  handleCallback(state: string, code: string): Promise<AccountId>;
  refreshToken(accountId: AccountId): Promise<void>;
  revokeAccount(accountId: AccountId): Promise<void>;
}

export interface AuthRepository {
  saveSession(session: OAuthSession): Promise<void>;
  findSessionByState(state: string): Promise<OAuthSession | null>;
  deleteSession(id: string): Promise<void>;
  
  saveCredentials(credentials: AuthCredentials): Promise<void>;
  findCredentials(accountId: AccountId): Promise<AuthCredentials | null>;
  deleteCredentials(accountId: AccountId): Promise<void>;
}
