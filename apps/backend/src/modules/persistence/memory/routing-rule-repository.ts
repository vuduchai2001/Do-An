import type { ModelId, ProviderId, RoutingRuleId } from '../../../core/domain/ids.js';
import type {
  RoutingRule,
  RoutingRuleCreateInput,
  RoutingRuleUpdateInput,
} from '../../../core/domain/entities/routing-rule.js';
import type { RoutingRuleRepository } from '../repositories.js';
import { generateId } from '../../../core/utils/index.js';

const RoutingRuleIdHelper = {
  create: (id: string) => id as RoutingRuleId,
};

export class InMemoryRoutingRuleRepository implements RoutingRuleRepository {
  private store: Map<string, RoutingRule> = new Map();

  async findById(id: RoutingRuleId): Promise<RoutingRule | null> {
    return this.store.get(id as string) ?? null;
  }

  async findAll(): Promise<RoutingRule[]> {
    return Array.from(this.store.values()).sort((a, b) => b.priority - a.priority);
  }

  async findByProvider(providerId: ProviderId): Promise<RoutingRule[]> {
    return Array.from(this.store.values())
      .filter((rule) => rule.providerId === providerId)
      .sort((a, b) => b.priority - a.priority);
  }

  async findByModelPattern(modelId: ModelId): Promise<RoutingRule[]> {
    const model = modelId as string;
    return Array.from(this.store.values())
      .filter((rule) => {
        if (rule.modelPattern === '*') {
          return true;
        }
        if (rule.modelPattern.endsWith('*')) {
          return model.startsWith(rule.modelPattern.slice(0, -1));
        }
        return model === rule.modelPattern;
      })
      .sort((a, b) => b.priority - a.priority);
  }

  async findEnabled(): Promise<RoutingRule[]> {
    return Array.from(this.store.values())
      .filter((rule) => rule.status === 'enabled')
      .sort((a, b) => b.priority - a.priority);
  }

  async create(input: RoutingRuleCreateInput): Promise<RoutingRule> {
    const id = RoutingRuleIdHelper.create(generateId());
    const now = new Date();
    const rule: RoutingRule = {
      id,
      name: input.name,
      description: input.description,
      status: 'enabled',
      modelPattern: input.modelPattern,
      providerId: input.providerId,
      priority: input.priority,
      strategy: input.strategy ?? 'round-robin',
      constraints: input.constraints,
      createdAt: now,
      updatedAt: now,
    };

    this.store.set(id as string, rule);
    return rule;
  }

  async update(id: RoutingRuleId, input: RoutingRuleUpdateInput): Promise<RoutingRule> {
    const existing = this.store.get(id as string);
    if (!existing) {
      throw new Error(`Routing rule not found: ${id}`);
    }

    const updated: RoutingRule = {
      ...existing,
      ...input,
      updatedAt: new Date(),
    };

    this.store.set(id as string, updated);
    return updated;
  }

  async delete(id: RoutingRuleId): Promise<void> {
    this.store.delete(id as string);
  }
}
