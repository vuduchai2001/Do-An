import type { AccountId, ProviderId } from '../../core/domain/index.js';

export interface AdminAccount {
  id: AccountId;
  providerId: ProviderId;
  status: 'active' | 'suspended' | 'disabled';
  createdAt: Date;
  updatedAt: Date;
}

export interface AdminAccountRepository {
  findById(id: AccountId): Promise<AdminAccount | null>;
  findByProvider(providerId: ProviderId): Promise<AdminAccount[]>;
  save(account: AdminAccount): Promise<void>;
  delete(id: AccountId): Promise<void>;
}

export interface AdminService {
  listAccounts(): Promise<AdminAccount[]>;
  getAccount(id: AccountId): Promise<AdminAccount | null>;
  updateAccountStatus(id: AccountId, status: AdminAccount['status']): Promise<void>;
}
