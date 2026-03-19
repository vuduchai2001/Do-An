import { AccountId as AccountIdHelper } from '../../../core/domain/ids.js';
import type { AccountId, ProviderId } from '../../../core/domain/ids.js';
import type { AccountStatus } from '../../../core/domain/enums.js';
import type {
  Account,
  AccountCreateInput,
  AccountUpdateInput,
} from '../../../core/domain/entities/account.js';
import type { AccountRepository } from '../repositories.js';
import { generateId } from '../../../core/utils/index.js';

export class InMemoryAccountRepository implements AccountRepository {
  private store: Map<string, Account> = new Map();

  async findById(id: AccountId): Promise<Account | null> {
    return this.store.get(id as string) ?? null;
  }

  async findByProvider(providerId: ProviderId): Promise<Account[]> {
    return Array.from(this.store.values()).filter((account) => account.providerId === providerId);
  }

  async findByStatus(status: AccountStatus): Promise<Account[]> {
    return Array.from(this.store.values()).filter((account) => account.status === status);
  }

  async findAll(): Promise<Account[]> {
    return Array.from(this.store.values());
  }

  async create(input: AccountCreateInput): Promise<Account> {
    const id = AccountIdHelper.create(generateId());
    const now = new Date();
    const account: Account = {
      id,
      providerId: input.providerId,
      status: 'active',
      credentials: input.credentials,
      metadata: input.metadata ?? {},
      createdAt: now,
      updatedAt: now,
    };
    this.store.set(id as string, account);
    return account;
  }

  async update(id: AccountId, input: AccountUpdateInput): Promise<Account> {
    const existing = this.store.get(id as string);
    if (!existing) {
      throw new Error(`Account not found: ${id}`);
    }

    const updated: Account = {
      ...existing,
      status: input.status ?? existing.status,
      credentials: input.credentials
        ? { ...existing.credentials, ...input.credentials }
        : existing.credentials,
      metadata: input.metadata ? { ...existing.metadata, ...input.metadata } : existing.metadata,
      updatedAt: new Date(),
    };

    this.store.set(id as string, updated);
    return updated;
  }

  async delete(id: AccountId): Promise<void> {
    this.store.delete(id as string);
  }
}
