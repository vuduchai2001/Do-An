import type { AccountId, ModelId, QuotaStateId } from '../../../core/domain/ids.js';
import type {
  QuotaState,
  QuotaStateCreateInput,
} from '../../../core/domain/entities/quota-state.js';
import type { QuotaStateRepository } from '../repositories.js';
import { generateId } from '../../../core/utils/index.js';

const QuotaStateIdHelper = {
  create: (id: string) => id as QuotaStateId,
};

export class InMemoryQuotaStateRepository implements QuotaStateRepository {
  private store: Map<string, QuotaState> = new Map();

  private keyFor(accountId: AccountId, modelId: ModelId): string {
    return `${accountId}:${modelId}`;
  }

  async findById(id: QuotaStateId): Promise<QuotaState | null> {
    return Array.from(this.store.values()).find((quotaState) => quotaState.id === id) ?? null;
  }

  async findByAccount(accountId: AccountId): Promise<QuotaState[]> {
    return Array.from(this.store.values()).filter(
      (quotaState) => quotaState.accountId === accountId,
    );
  }

  async findByAccountAndModel(accountId: AccountId, modelId: ModelId): Promise<QuotaState | null> {
    return this.store.get(this.keyFor(accountId, modelId)) ?? null;
  }

  async findExhausted(): Promise<QuotaState[]> {
    return Array.from(this.store.values()).filter((quotaState) => quotaState.exhausted);
  }

  async findInCooldown(): Promise<QuotaState[]> {
    const now = new Date();
    return Array.from(this.store.values()).filter(
      (quotaState) => quotaState.cooldownUntil && quotaState.cooldownUntil > now,
    );
  }

  async create(input: QuotaStateCreateInput): Promise<QuotaState> {
    const id = QuotaStateIdHelper.create(generateId());
    const now = new Date();
    const quotaState: QuotaState = {
      id,
      accountId: input.accountId,
      modelId: input.modelId,
      exhausted: false,
      limits: input.limits ?? {},
      usage: {
        requestsInMinute: 0,
        requestsInHour: 0,
        requestsInDay: 0,
        tokensInMinute: 0,
        tokensInDay: 0,
      },
      lastCheckedAt: now,
      createdAt: now,
      updatedAt: now,
    };

    this.store.set(this.keyFor(input.accountId, input.modelId), quotaState);
    return quotaState;
  }

  async update(id: QuotaStateId, updates: Partial<QuotaState>): Promise<QuotaState> {
    const existing = Array.from(this.store.values()).find((quotaState) => quotaState.id === id);
    if (!existing) {
      throw new Error(`Quota state not found: ${id}`);
    }

    const updated: QuotaState = {
      ...existing,
      ...updates,
      updatedAt: new Date(),
    };

    this.store.set(this.keyFor(existing.accountId, existing.modelId), updated);
    return updated;
  }

  async delete(id: QuotaStateId): Promise<void> {
    const existing = Array.from(this.store.values()).find((quotaState) => quotaState.id === id);
    if (existing) {
      this.store.delete(this.keyFor(existing.accountId, existing.modelId));
    }
  }

  async deleteByAccount(accountId: AccountId): Promise<void> {
    for (const [key, quotaState] of this.store.entries()) {
      if (quotaState.accountId === accountId) {
        this.store.delete(key);
      }
    }
  }
}
