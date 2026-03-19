import type { Pool } from 'pg';
import type { QuotaStateRepository } from '../repositories.js';
import type {
  QuotaState,
  QuotaStateCreateInput,
} from '../../../core/domain/entities/quota-state.js';
import type { AccountId, ModelId, QuotaStateId } from '../../../core/domain/ids.js';
import type { QuotaStateRow } from './types.js';
import {
  quotaStateCreateInputToRecord,
  quotaStateRecordToDomain,
  quotaStateRowToRecord,
  quotaStateUpdateToRecord,
} from './mappers.js';
import { QuotaStateId as QuotaStateIdHelper } from '../../../core/domain/ids.js';
import { generateId } from '../../../core/utils/index.js';

function toQuotaState(row: QuotaStateRow): QuotaState {
  return quotaStateRecordToDomain(quotaStateRowToRecord(row));
}

function createId(): QuotaStateId {
  return QuotaStateIdHelper.create(generateId());
}

export class PostgresQuotaStateRepository implements QuotaStateRepository {
  constructor(private readonly pool: Pool) {}

  async findById(id: QuotaStateId): Promise<QuotaState | null> {
    const result = await this.pool.query<QuotaStateRow>(
      'SELECT * FROM quota_states WHERE id = $1',
      [id],
    );
    return result.rows[0] ? toQuotaState(result.rows[0]) : null;
  }

  async findByAccount(accountId: AccountId): Promise<QuotaState[]> {
    const result = await this.pool.query<QuotaStateRow>(
      'SELECT * FROM quota_states WHERE account_id = $1',
      [accountId],
    );
    return result.rows.map(toQuotaState);
  }

  async findByAccountAndModel(accountId: AccountId, modelId: ModelId): Promise<QuotaState | null> {
    const result = await this.pool.query<QuotaStateRow>(
      'SELECT * FROM quota_states WHERE account_id = $1 AND model_id = $2',
      [accountId, modelId],
    );
    return result.rows[0] ? toQuotaState(result.rows[0]) : null;
  }

  async findExhausted(): Promise<QuotaState[]> {
    const result = await this.pool.query<QuotaStateRow>(
      'SELECT * FROM quota_states WHERE exhausted = true',
    );
    return result.rows.map(toQuotaState);
  }

  async findInCooldown(): Promise<QuotaState[]> {
    const result = await this.pool.query<QuotaStateRow>(
      'SELECT * FROM quota_states WHERE cooldown_until > $1',
      [new Date()],
    );
    return result.rows.map(toQuotaState);
  }

  async create(input: QuotaStateCreateInput): Promise<QuotaState> {
    const id = createId();
    const now = new Date();
    const record = quotaStateCreateInputToRecord(input);

    const result = await this.pool.query<QuotaStateRow>(
      `INSERT INTO quota_states (
        id, account_id, model_id, exhausted, exhaustion_reason, exhaustion_message,
        cooldown_until, cooldown_reason,
        limits_requests_per_minute, limits_requests_per_hour, limits_requests_per_day,
        limits_tokens_per_minute, limits_tokens_per_day,
        usage_requests_in_minute, usage_requests_in_hour, usage_requests_in_day,
        usage_tokens_in_minute, usage_tokens_in_day,
        last_checked_at, created_at, updated_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6,
        $7, $8,
        $9, $10, $11,
        $12, $13,
        $14, $15, $16,
        $17, $18,
        $19, $20, $21
      ) RETURNING *`,
      [
        id,
        record.accountId,
        record.modelId,
        false,
        null,
        null,
        null,
        null,
        record.limitsRequestsPerMinute ?? null,
        record.limitsRequestsPerHour ?? null,
        record.limitsRequestsPerDay ?? null,
        record.limitsTokensPerMinute ?? null,
        record.limitsTokensPerDay ?? null,
        0,
        0,
        0,
        0,
        0,
        now,
        now,
        now,
      ],
    );

    return toQuotaState(result.rows[0]);
  }

  async update(id: QuotaStateId, updates: Partial<QuotaState>): Promise<QuotaState> {
    const existing = await this.findById(id);
    if (!existing) {
      throw new Error(`Quota state not found: ${id}`);
    }

    const mapped = quotaStateUpdateToRecord(updates);
    const result = await this.pool.query<QuotaStateRow>(
      `UPDATE quota_states SET
        exhausted = $2,
        exhaustion_reason = $3,
        exhaustion_message = $4,
        cooldown_until = $5,
        cooldown_reason = $6,
        limits_requests_per_minute = $7,
        limits_requests_per_hour = $8,
        limits_requests_per_day = $9,
        limits_tokens_per_minute = $10,
        limits_tokens_per_day = $11,
        usage_requests_in_minute = $12,
        usage_requests_in_hour = $13,
        usage_requests_in_day = $14,
        usage_tokens_in_minute = $15,
        usage_tokens_in_day = $16,
        last_checked_at = $17,
        updated_at = $18
      WHERE id = $1
      RETURNING *`,
      [
        id,
        mapped.exhausted ?? existing.exhausted,
        mapped.exhaustionReason ?? existing.exhaustionReason ?? null,
        mapped.exhaustionMessage ?? existing.exhaustionMessage ?? null,
        mapped.cooldownUntil ?? existing.cooldownUntil ?? null,
        mapped.cooldownReason ?? existing.cooldownReason ?? null,
        mapped.limitsRequestsPerMinute ?? existing.limits.requestsPerMinute ?? null,
        mapped.limitsRequestsPerHour ?? existing.limits.requestsPerHour ?? null,
        mapped.limitsRequestsPerDay ?? existing.limits.requestsPerDay ?? null,
        mapped.limitsTokensPerMinute ?? existing.limits.tokensPerMinute ?? null,
        mapped.limitsTokensPerDay ?? existing.limits.tokensPerDay ?? null,
        mapped.usageRequestsInMinute ?? existing.usage.requestsInMinute,
        mapped.usageRequestsInHour ?? existing.usage.requestsInHour,
        mapped.usageRequestsInDay ?? existing.usage.requestsInDay,
        mapped.usageTokensInMinute ?? existing.usage.tokensInMinute,
        mapped.usageTokensInDay ?? existing.usage.tokensInDay,
        mapped.lastCheckedAt ?? existing.lastCheckedAt,
        new Date(),
      ],
    );

    return toQuotaState(result.rows[0]);
  }

  async delete(id: QuotaStateId): Promise<void> {
    await this.pool.query('DELETE FROM quota_states WHERE id = $1', [id]);
  }

  async deleteByAccount(accountId: AccountId): Promise<void> {
    await this.pool.query('DELETE FROM quota_states WHERE account_id = $1', [accountId]);
  }
}
