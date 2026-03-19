import type { ProviderId } from '../../../core/domain/ids.js';
import type {
  Provider,
  ProviderCreateInput,
  ProviderUpdateInput,
} from '../../../core/domain/entities/provider.js';
import type { ProviderRepository } from '../repositories.js';

export class InMemoryProviderRepository implements ProviderRepository {
  private store: Map<string, Provider> = new Map();

  async findById(id: ProviderId): Promise<Provider | null> {
    return this.store.get(id as string) ?? null;
  }

  async findByType(type: Provider['type']): Promise<Provider[]> {
    return Array.from(this.store.values()).filter((provider) => provider.type === type);
  }

  async findByStatus(status: Provider['status']): Promise<Provider[]> {
    return Array.from(this.store.values()).filter((provider) => provider.status === status);
  }

  async findAll(): Promise<Provider[]> {
    return Array.from(this.store.values());
  }

  async create(input: ProviderCreateInput): Promise<Provider> {
    const now = new Date();
    const provider: Provider = {
      id: input.id,
      name: input.name,
      type: input.type,
      status: 'connected',
      models: input.models ?? [],
      config: input.config,
      createdAt: now,
      updatedAt: now,
    };
    this.store.set(input.id as string, provider);
    return provider;
  }

  async update(id: ProviderId, input: ProviderUpdateInput): Promise<Provider> {
    const existing = this.store.get(id as string);
    if (!existing) {
      throw new Error(`Provider not found: ${id}`);
    }

    const updated: Provider = {
      ...existing,
      name: input.name ?? existing.name,
      status: input.status ?? existing.status,
      models: input.models ?? existing.models,
      config: input.config ? { ...existing.config, ...input.config } : existing.config,
      updatedAt: new Date(),
    };

    this.store.set(id as string, updated);
    return updated;
  }

  async delete(id: ProviderId): Promise<void> {
    this.store.delete(id as string);
  }
}
