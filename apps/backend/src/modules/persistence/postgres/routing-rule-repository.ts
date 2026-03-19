import type { Pool } from 'pg';
import type { RoutingRuleRepository } from '../repositories.js';
import type {
  RoutingRule,
  RoutingRuleCreateInput,
  RoutingRuleUpdateInput,
} from '../../../core/domain/entities/routing-rule.js';
import type { ModelId, ProviderId, RoutingRuleId } from '../../../core/domain/ids.js';
import type { RoutingRuleRow } from './types.js';
import {
  routingRuleCreateInputToRecord,
  routingRuleRecordToDomain,
  routingRuleRowToRecord,
  routingRuleUpdateInputToRecord,
} from './mappers.js';
import { RoutingRuleId as RoutingRuleIdHelper } from '../../../core/domain/ids.js';
import { generateId } from '../../../core/utils/index.js';

function toRoutingRule(row: RoutingRuleRow): RoutingRule {
  return routingRuleRecordToDomain(routingRuleRowToRecord(row));
}

function createId(): RoutingRuleId {
  return RoutingRuleIdHelper.create(generateId());
}

export class PostgresRoutingRuleRepository implements RoutingRuleRepository {
  constructor(private readonly pool: Pool) {}

  async findById(id: RoutingRuleId): Promise<RoutingRule | null> {
    const result = await this.pool.query<RoutingRuleRow>(
      'SELECT * FROM routing_rules WHERE id = $1',
      [id],
    );
    return result.rows[0] ? toRoutingRule(result.rows[0]) : null;
  }

  async findAll(): Promise<RoutingRule[]> {
    const result = await this.pool.query<RoutingRuleRow>(
      'SELECT * FROM routing_rules ORDER BY priority DESC',
    );
    return result.rows.map(toRoutingRule);
  }

  async findByProvider(providerId: ProviderId): Promise<RoutingRule[]> {
    const result = await this.pool.query<RoutingRuleRow>(
      'SELECT * FROM routing_rules WHERE provider_id = $1 ORDER BY priority DESC',
      [providerId],
    );
    return result.rows.map(toRoutingRule);
  }

  async findByModelPattern(modelId: ModelId): Promise<RoutingRule[]> {
    const value = String(modelId);
    const result = await this.pool.query<RoutingRuleRow>(
      `SELECT * FROM routing_rules
       WHERE model_pattern = '*'
          OR model_pattern = $1
          OR ($1 LIKE REPLACE(model_pattern, '*', '%') AND model_pattern LIKE '%*')
       ORDER BY priority DESC`,
      [value],
    );
    return result.rows.map(toRoutingRule);
  }

  async findEnabled(): Promise<RoutingRule[]> {
    const result = await this.pool.query<RoutingRuleRow>(
      'SELECT * FROM routing_rules WHERE status = $1 ORDER BY priority DESC',
      ['enabled'],
    );
    return result.rows.map(toRoutingRule);
  }

  async create(input: RoutingRuleCreateInput): Promise<RoutingRule> {
    const id = createId();
    const now = new Date();
    const record = routingRuleCreateInputToRecord(input);

    const result = await this.pool.query<RoutingRuleRow>(
      `INSERT INTO routing_rules (
        id, name, description, status, model_pattern, provider_id, priority,
        strategy, constraints, created_at, updated_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7,
        $8, $9::jsonb, $10, $11
      ) RETURNING *`,
      [
        id,
        record.name,
        record.description ?? null,
        'enabled',
        record.modelPattern,
        record.providerId,
        record.priority,
        record.strategy,
        record.constraints ?? null,
        now,
        now,
      ],
    );

    return toRoutingRule(result.rows[0]);
  }

  async update(id: RoutingRuleId, input: RoutingRuleUpdateInput): Promise<RoutingRule> {
    const existing = await this.findById(id);
    if (!existing) {
      throw new Error(`Routing rule not found: ${id}`);
    }

    const updates = routingRuleUpdateInputToRecord(input);
    const result = await this.pool.query<RoutingRuleRow>(
      `UPDATE routing_rules SET
        name = $2,
        description = $3,
        status = $4,
        model_pattern = $5,
        provider_id = $6,
        priority = $7,
        strategy = $8,
        constraints = $9::jsonb,
        updated_at = $10
      WHERE id = $1
      RETURNING *`,
      [
        id,
        updates.name ?? existing.name,
        updates.description ?? existing.description ?? null,
        updates.status ?? existing.status,
        updates.modelPattern ?? existing.modelPattern,
        updates.providerId ?? existing.providerId,
        updates.priority ?? existing.priority,
        updates.strategy ?? existing.strategy,
        updates.constraints ?? (existing.constraints ? JSON.stringify(existing.constraints) : null),
        new Date(),
      ],
    );

    return toRoutingRule(result.rows[0]);
  }

  async delete(id: RoutingRuleId): Promise<void> {
    await this.pool.query('DELETE FROM routing_rules WHERE id = $1', [id]);
  }
}
