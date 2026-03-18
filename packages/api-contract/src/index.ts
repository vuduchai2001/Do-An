export interface HealthResponse {
  ok: boolean;
  service: string;
  timestamp?: string;
}

export interface AdminAccountSummary {
  id: string;
  providerId: string;
  status: 'active' | 'suspended' | 'exhausted' | 'cooldown';
}
