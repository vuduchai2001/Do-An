import type { ProviderId, SessionId } from '../../../core/domain/ids.js';
import type { OAuthSessionStatus } from '../../../core/domain/enums.js';
import type {
  OAuthSession,
  OAuthSessionCreateInput,
} from '../../../core/domain/entities/oauth-session.js';
import type { OAuthSessionRepository } from '../repositories.js';
import { generateId } from '../../../core/utils/index.js';

const SessionIdHelper = {
  create: (id: string) => id as SessionId,
};

export class InMemoryOAuthSessionRepository implements OAuthSessionRepository {
  private store: Map<string, OAuthSession> = new Map();

  async findById(id: SessionId): Promise<OAuthSession | null> {
    return this.store.get(id as string) ?? null;
  }

  async findByState(state: string): Promise<OAuthSession | null> {
    return Array.from(this.store.values()).find((session) => session.state === state) ?? null;
  }

  async findByProvider(
    providerId: ProviderId,
    status?: OAuthSessionStatus,
  ): Promise<OAuthSession[]> {
    return Array.from(this.store.values()).filter(
      (session) => session.providerId === providerId && (!status || session.status === status),
    );
  }

  async findExpired(): Promise<OAuthSession[]> {
    const now = new Date();
    return Array.from(this.store.values()).filter((session) => session.expiresAt < now);
  }

  async create(input: OAuthSessionCreateInput): Promise<OAuthSession> {
    const id = SessionIdHelper.create(generateId());
    const now = new Date();
    const session: OAuthSession = {
      id,
      providerId: input.providerId,
      status: 'pending',
      state: input.state,
      codeVerifier: input.codeVerifier,
      redirectUri: input.redirectUri,
      createdAt: now,
      expiresAt: new Date(now.getTime() + input.expiresInSeconds * 1000),
    };

    this.store.set(id as string, session);
    return session;
  }

  async update(id: SessionId, updates: Partial<OAuthSession>): Promise<OAuthSession> {
    const existing = this.store.get(id as string);
    if (!existing) {
      throw new Error(`OAuth session not found: ${id}`);
    }

    const updated: OAuthSession = {
      ...existing,
      ...updates,
    };

    this.store.set(id as string, updated);
    return updated;
  }

  async delete(id: SessionId): Promise<void> {
    this.store.delete(id as string);
  }

  async deleteExpired(): Promise<number> {
    const expired = await this.findExpired();
    for (const session of expired) {
      this.store.delete(session.id as string);
    }
    return expired.length;
  }
}
