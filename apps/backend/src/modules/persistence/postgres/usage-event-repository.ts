import type { Pool } from 'pg';
import type { UsageEventRepository } from '../repositories.js';
import type {
  UsageEvent,
  UsageEventCreateInput,
} from '../../../core/domain/entities/usage-event.js';
import type { AccountId, ProviderId, UsageEventId } from '../../../core/domain/ids.js';
import type { UsageAggregate } from '../records.js';
import type { UsageEventRow } from './types.js';
import {
  usageEventCreateInputToRecord,
  usageEventRecordToDomain,
  usageEventRowToRecord,
  usageEventUpdateToRecord,
} from './mappers.js';
import { UsageEventId as UsageEventIdHelper } from '../../../core/domain/ids.js';
import { generateId } from '../../../core/utils/index.js';

function toUsageEvent(row: UsageEventRow): UsageEvent {
  return usageEventRecordToDomain(usageEventRowToRecord(row));
}

function createId(): UsageEventId {
  return UsageEventIdHelper.create(generateId());
}

export class PostgresUsageEventRepository implements UsageEventRepository {
  constructor(private readonly pool: Pool) {}

  async findById(id: UsageEventId): Promise<UsageEvent | null> {
    const result = await this.pool.query<UsageEventRow>(
      'SELECT * FROM usage_events WHERE id = $1',
      [id],
    );
    return result.rows[0] ? toUsageEvent(result.rows[0]) : null;
  }

  async findByAccount(
    accountId: AccountId,
    options?: { since?: Date; until?: Date; limit?: number; offset?: number },
  ): Promise<UsageEvent[]> {
    const clauses = ['account_id = $1'];
    const values: unknown[] = [accountId];

    if (options?.since) {
      values.push(options.since);
      clauses.push(`created_at >= $${values.length}`);
    }

    if (options?.until) {
      values.push(options.until);
      clauses.push(`created_at <= $${values.length}`);
    }

    values.push(options?.limit ?? 1000, options?.offset ?? 0);
    const result = await this.pool.query<UsageEventRow>(
      `SELECT * FROM usage_events WHERE ${clauses.join(' AND ')} ORDER BY created_at DESC LIMIT $${values.length - 1} OFFSET $${values.length}`,
      values,
    );

    return result.rows.map(toUsageEvent);
  }

  async findByProvider(
    providerId: ProviderId,
    options?: { since?: Date; limit?: number },
  ): Promise<UsageEvent[]> {
    const values: unknown[] = [providerId];
    let sql = 'SELECT * FROM usage_events WHERE provider_id = $1';

    if (options?.since) {
      values.push(options.since);
      sql += ` AND created_at >= $${values.length}`;
    }

    values.push(options?.limit ?? 1000);
    sql += ` ORDER BY created_at DESC LIMIT $${values.length}`;

    const result = await this.pool.query<UsageEventRow>(sql, values);
    return result.rows.map(toUsageEvent);
  }

  async create(input: UsageEventCreateInput): Promise<UsageEvent> {
    const id = createId();
    const now = new Date();
    const record = usageEventCreateInputToRecord(input);

    const result = await this.pool.query<UsageEventRow>(
      `INSERT INTO usage_events (
        id, account_id, provider_id, status,
        request_model_id, request_message_count, request_max_tokens, request_temperature, request_streaming,
        response_finish_reason, response_http_code, response_provider_request_id,
        tokens_prompt, tokens_completion, tokens_total,
        timing_started_at, timing_completed_at, timing_duration_ms, timing_time_to_first_token_ms,
        error_code, error_message, metadata, created_at
      ) VALUES (
        $1, $2, $3, $4,
        $5, $6, $7, $8, $9,
        $10, $11, $12,
        $13, $14, $15,
        $16, $17, $18, $19,
        $20, $21, $22::jsonb, $23
      ) RETURNING *`,
      [
        id,
        record.accountId,
        record.providerId,
        'success',
        record.requestModelId,
        record.requestMessageCount,
        record.requestMaxTokens ?? null,
        record.requestTemperature ?? null,
        record.requestStreaming,
        null,
        null,
        null,
        null,
        null,
        null,
        record.timingStartedAt,
        record.timingCompletedAt,
        record.timingDurationMs,
        record.timingTimeToFirstTokenMs ?? null,
        null,
        null,
        record.metadata ?? null,
        now,
      ],
    );

    return toUsageEvent(result.rows[0]);
  }

  async update(id: UsageEventId, updates: Partial<UsageEvent>): Promise<UsageEvent> {
    const existing = await this.findById(id);
    if (!existing) {
      throw new Error(`Usage event not found: ${id}`);
    }

    const mapped = usageEventUpdateToRecord(updates);
    const result = await this.pool.query<UsageEventRow>(
      `UPDATE usage_events SET
        status = $2,
        request_model_id = $3,
        request_message_count = $4,
        request_max_tokens = $5,
        request_temperature = $6,
        request_streaming = $7,
        response_finish_reason = $8,
        response_http_code = $9,
        response_provider_request_id = $10,
        tokens_prompt = $11,
        tokens_completion = $12,
        tokens_total = $13,
        timing_started_at = $14,
        timing_completed_at = $15,
        timing_duration_ms = $16,
        timing_time_to_first_token_ms = $17,
        error_code = $18,
        error_message = $19,
        metadata = $20::jsonb
      WHERE id = $1
      RETURNING *`,
      [
        id,
        mapped.status ?? existing.status,
        mapped.requestModelId ?? existing.request.modelId,
        mapped.requestMessageCount ?? existing.request.messageCount,
        mapped.requestMaxTokens ?? existing.request.maxTokens ?? null,
        mapped.requestTemperature ?? existing.request.temperature ?? null,
        mapped.requestStreaming ?? existing.request.streaming,
        mapped.responseFinishReason ?? existing.response?.finishReason ?? null,
        mapped.responseHttpCode ?? existing.response?.httpResponseCode ?? null,
        mapped.responseProviderRequestId ?? existing.response?.providerRequestId ?? null,
        mapped.tokensPrompt ?? existing.tokens?.promptTokens ?? null,
        mapped.tokensCompletion ?? existing.tokens?.completionTokens ?? null,
        mapped.tokensTotal ?? existing.tokens?.totalTokens ?? null,
        mapped.timingStartedAt ?? existing.timing.startedAt,
        mapped.timingCompletedAt ?? existing.timing.completedAt,
        mapped.timingDurationMs ?? existing.timing.durationMs,
        mapped.timingTimeToFirstTokenMs ?? existing.timing.timeToFirstTokenMs ?? null,
        mapped.errorCode ?? existing.errorCode ?? null,
        mapped.errorMessage ?? existing.errorMessage ?? null,
        mapped.metadata ?? (existing.metadata ? JSON.stringify(existing.metadata) : null),
      ],
    );

    return toUsageEvent(result.rows[0]);
  }

  async aggregate(
    accountId: AccountId,
    periodStart: Date,
    periodEnd: Date,
  ): Promise<UsageAggregate> {
    const result = await this.pool.query<{
      total_requests: string;
      success_count: string;
      error_count: string;
      total_prompt_tokens: string | null;
      total_completion_tokens: string | null;
    }>(
      `SELECT
         COUNT(*)::text AS total_requests,
         COUNT(*) FILTER (WHERE status = 'success')::text AS success_count,
         COUNT(*) FILTER (WHERE status != 'success')::text AS error_count,
         COALESCE(SUM(tokens_prompt), 0)::text AS total_prompt_tokens,
         COALESCE(SUM(tokens_completion), 0)::text AS total_completion_tokens
       FROM usage_events
       WHERE account_id = $1 AND created_at >= $2 AND created_at <= $3`,
      [accountId, periodStart, periodEnd],
    );

    const row = result.rows[0];
    return {
      accountId,
      periodStart,
      periodEnd,
      totalRequests: Number(row?.total_requests ?? '0'),
      successCount: Number(row?.success_count ?? '0'),
      errorCount: Number(row?.error_count ?? '0'),
      totalPromptTokens: Number(row?.total_prompt_tokens ?? '0'),
      totalCompletionTokens: Number(row?.total_completion_tokens ?? '0'),
    };
  }

  async countByAccount(accountId: AccountId, since?: Date): Promise<number> {
    const result = since
      ? await this.pool.query<{ count: string }>(
          'SELECT COUNT(*)::text AS count FROM usage_events WHERE account_id = $1 AND created_at >= $2',
          [accountId, since],
        )
      : await this.pool.query<{ count: string }>(
          'SELECT COUNT(*)::text AS count FROM usage_events WHERE account_id = $1',
          [accountId],
        );

    return Number(result.rows[0]?.count ?? '0');
  }
}
