/**
 * Account entity - represents a connected provider account.
 */
import type { AccountId, ProviderId } from '../ids.js';
import type { AccountStatus } from '../enums.js';

export interface AccountCredentials {
  accessToken: string;
  refreshToken?: string;
  expiresAt?: Date;
  scopes?: string[];
}

export interface AccountMetadata {
  email?: string;
  name?: string;
  organizationId?: string;
  labels?: string[];
  customAttributes?: Record<string, unknown>;
}

export interface Account {
  id: AccountId;
  providerId: ProviderId;
  status: AccountStatus;
  
  credentials: AccountCredentials;
  metadata: AccountMetadata;
  
  createdAt: Date;
  updatedAt: Date;
  lastUsedAt?: Date;
  lastRefreshAt?: Date;
}

export interface AccountCreateInput {
  providerId: ProviderId;
  credentials: AccountCredentials;
  metadata?: AccountMetadata;
}

export interface AccountUpdateInput {
  status?: AccountStatus;
  credentials?: Partial<AccountCredentials>;
  metadata?: Partial<AccountMetadata>;
}
