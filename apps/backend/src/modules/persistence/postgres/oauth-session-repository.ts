import type { Pool } from 'pg';
import type { OAuthSessionRepository } from '../repositories.js';
import type {
  OAuthSession,
  OAuthSessionCreateInput,
} from '../../../core/domain/entities/oauth-session.js';
import type { ProviderId, SessionId } from '../../../core/domain/ids.js';
import type { OAuthSessionStatus } from '../../../core/domain/enums.js';
import type { OAuthSessionRow } from './types.js';
import {
  oauthSessionCreateInputToRecord,
  oauthSessionRecordToDomain,
  oauthSessionRowToRecord,
  oauthSessionUpdateToRecord,
} from './mappers.js';
import { SessionId as SessionIdHelper } from '../../../core/domain/ids.js';
import { generateId } from '../../../core/utils/index.js';

function toSession(row: OAuthSessionRow): OAuthSession {
  return oauthSessionRecordToDomain(oauthSessionRowToRecord(row));
}

function createId(): SessionId {
  return SessionIdHelper.create(generateId());
}

export class PostgresOAuthSessionRepository implements OAuthSessionRepository {
  constructor(private readonly pool: Pool) {}

  async findById(id: SessionId): Promise<OAuthSession | null> {
    const result = await this.pool.query<OAuthSessionRow>(
      'SELECT * FROM oauth_sessions WHERE id = $1',
      [id],
    );
    return result.rows[0] ? toSession(result.rows[0]) : null;
  }

  async findByState(state: string): Promise<OAuthSession | null> {
    const result = await this.pool.query<OAuthSessionRow>(
      'SELECT * FROM oauth_sessions WHERE state = $1',
      [state],
    );
    return result.rows[0] ? toSession(result.rows[0]) : null;
  }

  async findByProvider(
    providerId: ProviderId,
    status?: OAuthSessionStatus,
  ): Promise<OAuthSession[]> {
    const result = status
      ? await this.pool.query<OAuthSessionRow>(
          'SELECT * FROM oauth_sessions WHERE provider_id = $1 AND status = $2 ORDER BY created_at ASC',
          [providerId, status],
        )
      : await this.pool.query<OAuthSessionRow>(
          'SELECT * FROM oauth_sessions WHERE provider_id = $1 ORDER BY created_at ASC',
          [providerId],
        );

    return result.rows.map(toSession);
  }

  async findExpired(): Promise<OAuthSession[]> {
    const result = await this.pool.query<OAuthSessionRow>(
      'SELECT * FROM oauth_sessions WHERE expires_at < $1 ORDER BY expires_at ASC',
      [new Date()],
    );
    return result.rows.map(toSession);
  }

  async create(input: OAuthSessionCreateInput): Promise<OAuthSession> {
    const id = createId();
    const now = new Date();
    const record = oauthSessionCreateInputToRecord(input);
    const expiresAt = new Date(now.getTime() + input.expiresInSeconds * 1000);

    const result = await this.pool.query<OAuthSessionRow>(
      `INSERT INTO oauth_sessions (
        id, provider_id, status, state, code_verifier, redirect_uri,
        access_token, refresh_token, expires_in, token_type, token_scopes,
        account_id, error_message, created_at, expires_at, completed_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6,
        $7, $8, $9, $10, $11::jsonb,
        $12, $13, $14, $15, $16
      ) RETURNING *`,
      [
        id,
        record.providerId,
        'pending',
        record.state,
        record.codeVerifier ?? null,
        record.redirectUri ?? null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        now,
        expiresAt,
        null,
      ],
    );

    return toSession(result.rows[0]);
  }

  async update(id: SessionId, updates: Partial<OAuthSession>): Promise<OAuthSession> {
    const existing = await this.findById(id);
    if (!existing) {
      throw new Error(`OAuth session not found: ${id}`);
    }

    const mapped = oauthSessionUpdateToRecord(updates);
    const merged = {
      status: mapped.status ?? existing.status,
      state: mapped.state ?? existing.state,
      codeVerifier: mapped.codeVerifier ?? existing.codeVerifier ?? null,
      redirectUri: mapped.redirectUri ?? existing.redirectUri ?? null,
      accessToken: mapped.accessToken ?? existing.tokens?.accessToken ?? null,
      refreshToken: mapped.refreshToken ?? existing.tokens?.refreshToken ?? null,
      expiresIn: mapped.expiresIn ?? existing.tokens?.expiresIn ?? null,
      tokenType: mapped.tokenType ?? existing.tokens?.tokenType ?? null,
      tokenScopes:
        mapped.tokenScopes ??
        (existing.tokens?.scopes ? JSON.stringify(existing.tokens.scopes) : null),
      accountId: mapped.accountId ?? existing.accountId ?? null,
      errorMessage: mapped.errorMessage ?? existing.errorMessage ?? null,
      expiresAt: mapped.expiresAt ?? existing.expiresAt,
      completedAt: mapped.completedAt ?? existing.completedAt ?? null,
    };

    const result = await this.pool.query<OAuthSessionRow>(
      `UPDATE oauth_sessions SET
        status = $2,
        state = $3,
        code_verifier = $4,
        redirect_uri = $5,
        access_token = $6,
        refresh_token = $7,
        expires_in = $8,
        token_type = $9,
        token_scopes = $10::jsonb,
        account_id = $11,
        error_message = $12,
        expires_at = $13,
        completed_at = $14
      WHERE id = $1
      RETURNING *`,
      [
        id,
        merged.status,
        merged.state,
        merged.codeVerifier,
        merged.redirectUri,
        merged.accessToken,
        merged.refreshToken,
        merged.expiresIn,
        merged.tokenType,
        merged.tokenScopes,
        merged.accountId,
        merged.errorMessage,
        merged.expiresAt,
        merged.completedAt,
      ],
    );

    return toSession(result.rows[0]);
  }

  async delete(id: SessionId): Promise<void> {
    await this.pool.query('DELETE FROM oauth_sessions WHERE id = $1', [id]);
  }

  async deleteExpired(): Promise<number> {
    const result = await this.pool.query<{ count: string }>(
      `WITH deleted AS (
        DELETE FROM oauth_sessions WHERE expires_at < $1 RETURNING 1
      )
      SELECT COUNT(*)::text AS count FROM deleted`,
      [new Date()],
    );

    return Number(result.rows[0]?.count ?? '0');
  }
}
