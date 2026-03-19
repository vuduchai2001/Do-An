import type { Pool } from 'pg';
import type { ProviderRepository } from '../repositories.js';
import type {
  Provider,
  ProviderCreateInput,
  ProviderUpdateInput,
} from '../../../core/domain/entities/provider.js';
import type { ProviderId } from '../../../core/domain/ids.js';
import type { ProviderRow } from './types.js';
import {
  providerCreateInputToRecord,
  providerRecordToDomain,
  providerRowToRecord,
  providerUpdateInputToRecord,
} from './mappers.js';

function toProvider(row: ProviderRow): Provider {
  return providerRecordToDomain(providerRowToRecord(row));
}

export class PostgresProviderRepository implements ProviderRepository {
  constructor(private readonly pool: Pool) {}

  async findById(id: ProviderId): Promise<Provider | null> {
    const result = await this.pool.query<ProviderRow>('SELECT * FROM providers WHERE id = $1', [
      id,
    ]);
    return result.rows[0] ? toProvider(result.rows[0]) : null;
  }

  async findByType(type: Provider['type']): Promise<Provider[]> {
    const result = await this.pool.query<ProviderRow>(
      'SELECT * FROM providers WHERE type = $1 ORDER BY created_at ASC',
      [type],
    );
    return result.rows.map(toProvider);
  }

  async findByStatus(status: Provider['status']): Promise<Provider[]> {
    const result = await this.pool.query<ProviderRow>(
      'SELECT * FROM providers WHERE status = $1 ORDER BY created_at ASC',
      [status],
    );
    return result.rows.map(toProvider);
  }

  async findAll(): Promise<Provider[]> {
    const result = await this.pool.query<ProviderRow>(
      'SELECT * FROM providers ORDER BY created_at ASC',
    );
    return result.rows.map(toProvider);
  }

  async create(input: ProviderCreateInput): Promise<Provider> {
    const record = providerCreateInputToRecord(input);
    const now = new Date();

    const result = await this.pool.query<ProviderRow>(
      `INSERT INTO providers (
        id, name, type, status, models, authorization_url, token_url, device_code_url,
        scopes, api_base_url, default_timeout_ms, max_retries, created_at, updated_at
      ) VALUES (
        $1, $2, $3, $4, $5::jsonb, $6, $7, $8,
        $9::jsonb, $10, $11, $12, $13, $14
      ) RETURNING *`,
      [
        record.id,
        record.name,
        record.type,
        'connected',
        record.models,
        record.authorizationUrl ?? null,
        record.tokenUrl ?? null,
        record.deviceCodeUrl ?? null,
        record.scopes ?? null,
        record.apiBaseUrl,
        record.defaultTimeoutMs,
        record.maxRetries,
        now,
        now,
      ],
    );

    return toProvider(result.rows[0]);
  }

  async update(id: ProviderId, input: ProviderUpdateInput): Promise<Provider> {
    const existing = await this.findById(id);
    if (!existing) {
      throw new Error(`Provider not found: ${id}`);
    }

    const updates = providerUpdateInputToRecord(input);
    const merged = {
      name: updates.name ?? existing.name,
      status: updates.status ?? existing.status,
      models: updates.models ?? JSON.stringify(existing.models),
      authorizationUrl: updates.authorizationUrl ?? existing.config.authorizationUrl ?? null,
      tokenUrl: updates.tokenUrl ?? existing.config.tokenUrl ?? null,
      deviceCodeUrl: updates.deviceCodeUrl ?? existing.config.deviceCodeUrl ?? null,
      scopes:
        updates.scopes ?? (existing.config.scopes ? JSON.stringify(existing.config.scopes) : null),
      apiBaseUrl: updates.apiBaseUrl ?? existing.config.apiBaseUrl,
      defaultTimeoutMs: updates.defaultTimeoutMs ?? existing.config.defaultTimeoutMs,
      maxRetries: updates.maxRetries ?? existing.config.maxRetries,
    };

    const result = await this.pool.query<ProviderRow>(
      `UPDATE providers SET
        name = $2,
        status = $3,
        models = $4::jsonb,
        authorization_url = $5,
        token_url = $6,
        device_code_url = $7,
        scopes = $8::jsonb,
        api_base_url = $9,
        default_timeout_ms = $10,
        max_retries = $11,
        updated_at = $12
      WHERE id = $1
      RETURNING *`,
      [
        id,
        merged.name,
        merged.status,
        merged.models,
        merged.authorizationUrl,
        merged.tokenUrl,
        merged.deviceCodeUrl,
        merged.scopes,
        merged.apiBaseUrl,
        merged.defaultTimeoutMs,
        merged.maxRetries,
        new Date(),
      ],
    );

    return toProvider(result.rows[0]);
  }

  async delete(id: ProviderId): Promise<void> {
    await this.pool.query('DELETE FROM providers WHERE id = $1', [id]);
  }
}
