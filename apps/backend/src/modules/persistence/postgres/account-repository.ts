import type { Pool } from 'pg';
import type { AccountRepository } from '../repositories.js';
import type {
  Account,
  AccountCreateInput,
  AccountUpdateInput,
} from '../../../core/domain/entities/account.js';
import type { AccountId, ProviderId } from '../../../core/domain/ids.js';
import type { AccountRow } from './types.js';
import {
  accountCreateInputToRecord,
  accountRecordToDomain,
  accountRowToRecord,
  accountUpdateInputToRecord,
} from './mappers.js';
import { AccountId as AccountIdHelper } from '../../../core/domain/ids.js';
import { generateId } from '../../../core/utils/index.js';

function toAccount(row: AccountRow): Account {
  return accountRecordToDomain(accountRowToRecord(row));
}

function createId(): AccountId {
  return AccountIdHelper.create(generateId());
}

export class PostgresAccountRepository implements AccountRepository {
  constructor(private readonly pool: Pool) {}

  async findById(id: AccountId): Promise<Account | null> {
    const result = await this.pool.query<AccountRow>('SELECT * FROM accounts WHERE id = $1', [id]);
    return result.rows[0] ? toAccount(result.rows[0]) : null;
  }

  async findByProvider(providerId: ProviderId): Promise<Account[]> {
    const result = await this.pool.query<AccountRow>(
      'SELECT * FROM accounts WHERE provider_id = $1 ORDER BY created_at ASC',
      [providerId],
    );
    return result.rows.map(toAccount);
  }

  async findByStatus(status: Account['status']): Promise<Account[]> {
    const result = await this.pool.query<AccountRow>(
      'SELECT * FROM accounts WHERE status = $1 ORDER BY created_at ASC',
      [status],
    );
    return result.rows.map(toAccount);
  }

  async findAll(): Promise<Account[]> {
    const result = await this.pool.query<AccountRow>(
      'SELECT * FROM accounts ORDER BY created_at ASC',
    );
    return result.rows.map(toAccount);
  }

  async create(input: AccountCreateInput): Promise<Account> {
    const id = createId();
    const now = new Date();
    const record = accountCreateInputToRecord(input);

    const result = await this.pool.query<AccountRow>(
      `INSERT INTO accounts (
        id, provider_id, status, access_token, refresh_token, token_expires_at, token_scopes,
        email, name, organization_id, labels, custom_attributes, created_at, updated_at,
        last_used_at, last_refresh_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7::jsonb,
        $8, $9, $10, $11::jsonb, $12::jsonb, $13, $14,
        $15, $16
      ) RETURNING *`,
      [
        id,
        record.providerId,
        'active',
        record.accessToken,
        record.refreshToken ?? null,
        record.tokenExpiresAt ?? null,
        record.tokenScopes ? JSON.stringify(record.tokenScopes) : null,
        record.email ?? null,
        record.name ?? null,
        record.organizationId ?? null,
        record.labels ? JSON.stringify(record.labels) : null,
        record.customAttributes ?? null,
        now,
        now,
        null,
        null,
      ],
    );

    return toAccount(result.rows[0]);
  }

  async update(id: AccountId, input: AccountUpdateInput): Promise<Account> {
    const existing = await this.findById(id);
    if (!existing) {
      throw new Error(`Account not found: ${id}`);
    }

    const updates = accountUpdateInputToRecord(input);
    const merged = {
      status: updates.status ?? existing.status,
      accessToken: updates.accessToken ?? existing.credentials.accessToken,
      refreshToken: updates.refreshToken ?? existing.credentials.refreshToken ?? null,
      tokenExpiresAt: updates.tokenExpiresAt ?? existing.credentials.expiresAt ?? null,
      tokenScopes: updates.tokenScopes ?? existing.credentials.scopes ?? null,
      email: updates.email ?? existing.metadata.email ?? null,
      name: updates.name ?? existing.metadata.name ?? null,
      organizationId: updates.organizationId ?? existing.metadata.organizationId ?? null,
      labels: updates.labels ?? existing.metadata.labels ?? null,
      customAttributes:
        updates.customAttributes ??
        (existing.metadata.customAttributes
          ? JSON.stringify(existing.metadata.customAttributes)
          : null),
      lastUsedAt: existing.lastUsedAt ?? null,
      lastRefreshAt: existing.lastRefreshAt ?? null,
    };

    const result = await this.pool.query<AccountRow>(
      `UPDATE accounts SET
        status = $2,
        access_token = $3,
        refresh_token = $4,
        token_expires_at = $5,
        token_scopes = $6::jsonb,
        email = $7,
        name = $8,
        organization_id = $9,
        labels = $10::jsonb,
        custom_attributes = $11::jsonb,
        updated_at = $12,
        last_used_at = $13,
        last_refresh_at = $14
      WHERE id = $1
      RETURNING *`,
      [
        id,
        merged.status,
        merged.accessToken,
        merged.refreshToken,
        merged.tokenExpiresAt,
        merged.tokenScopes ? JSON.stringify(merged.tokenScopes) : null,
        merged.email,
        merged.name,
        merged.organizationId,
        merged.labels ? JSON.stringify(merged.labels) : null,
        merged.customAttributes,
        new Date(),
        merged.lastUsedAt,
        merged.lastRefreshAt,
      ],
    );

    return toAccount(result.rows[0]);
  }

  async delete(id: AccountId): Promise<void> {
    await this.pool.query('DELETE FROM accounts WHERE id = $1', [id]);
  }
}
