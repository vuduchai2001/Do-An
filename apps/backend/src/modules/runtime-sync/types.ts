import type { AccountId, ModelId, ProviderId } from '../../core/domain/index.js';

export interface RuntimeState {
  accounts: Map<AccountId, { providerId: ProviderId; healthy: boolean }>;
  models: Map<ModelId, ProviderId[]>;
  lastRefresh: Date;
}

export interface RuntimeSyncService {
  getState(): RuntimeState;
  refresh(): Promise<void>;

  onAccountAdded(accountId: AccountId, providerId: ProviderId): Promise<void>;
  onAccountRemoved(accountId: AccountId): Promise<void>;
  onAccountStatusChanged(accountId: AccountId, healthy: boolean): Promise<void>;

  onRoutingRuleChanged(): Promise<void>;
}

export interface RuntimeEvent {
  type: 'account_added' | 'account_removed' | 'account_status_changed' | 'routing_rule_changed';
  payload: Record<string, unknown>;
  timestamp: Date;
}

export interface RuntimeEventEmitter {
  emit(event: RuntimeEvent): void;
  subscribe(handler: (event: RuntimeEvent) => void): () => void;
}
