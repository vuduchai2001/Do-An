import type { AccountId, ProviderId, UsageEventId } from '../../../core/domain/ids.js';
import type {
  UsageEvent,
  UsageEventCreateInput,
} from '../../../core/domain/entities/usage-event.js';
import type { UsageEventRepository } from '../repositories.js';
import type { UsageAggregate } from '../records.js';
import { generateId } from '../../../core/utils/index.js';

const UsageEventIdHelper = {
  create: (id: string) => id as UsageEventId,
};

export class InMemoryUsageEventRepository implements UsageEventRepository {
  private store: Map<string, UsageEvent> = new Map();

  async findById(id: UsageEventId): Promise<UsageEvent | null> {
    return this.store.get(id as string) ?? null;
  }

  async findByAccount(
    accountId: AccountId,
    options?: { since?: Date; until?: Date; limit?: number; offset?: number },
  ): Promise<UsageEvent[]> {
    let events = Array.from(this.store.values())
      .filter((event) => event.accountId === accountId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    if (options?.since) {
      events = events.filter((event) => event.createdAt >= options.since!);
    }
    if (options?.until) {
      events = events.filter((event) => event.createdAt <= options.until!);
    }

    const offset = options?.offset ?? 0;
    const limit = options?.limit ?? events.length;
    return events.slice(offset, offset + limit);
  }

  async findByProvider(
    providerId: ProviderId,
    options?: { since?: Date; limit?: number },
  ): Promise<UsageEvent[]> {
    let events = Array.from(this.store.values())
      .filter((event) => event.providerId === providerId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    if (options?.since) {
      events = events.filter((event) => event.createdAt >= options.since!);
    }

    return events.slice(0, options?.limit ?? events.length);
  }

  async create(input: UsageEventCreateInput): Promise<UsageEvent> {
    const id = UsageEventIdHelper.create(generateId());
    const event: UsageEvent = {
      id,
      accountId: input.accountId,
      providerId: input.providerId,
      status: 'success',
      request: input.request,
      timing: input.timing,
      metadata: input.metadata,
      createdAt: new Date(),
    };

    this.store.set(id as string, event);
    return event;
  }

  async update(id: UsageEventId, updates: Partial<UsageEvent>): Promise<UsageEvent> {
    const existing = this.store.get(id as string);
    if (!existing) {
      throw new Error(`Usage event not found: ${id}`);
    }

    const updated: UsageEvent = {
      ...existing,
      ...updates,
    };

    this.store.set(id as string, updated);
    return updated;
  }

  async aggregate(
    accountId: AccountId,
    periodStart: Date,
    periodEnd: Date,
  ): Promise<UsageAggregate> {
    const events = await this.findByAccount(accountId, { since: periodStart, until: periodEnd });

    return {
      accountId,
      periodStart,
      periodEnd,
      totalRequests: events.length,
      successCount: events.filter((event) => event.status === 'success').length,
      errorCount: events.filter((event) => event.status !== 'success').length,
      totalPromptTokens: events.reduce((sum, event) => sum + (event.tokens?.promptTokens ?? 0), 0),
      totalCompletionTokens: events.reduce(
        (sum, event) => sum + (event.tokens?.completionTokens ?? 0),
        0,
      ),
    };
  }

  async countByAccount(accountId: AccountId, since?: Date): Promise<number> {
    let events = Array.from(this.store.values()).filter((event) => event.accountId === accountId);
    if (since) {
      events = events.filter((event) => event.createdAt >= since);
    }
    return events.length;
  }
}
