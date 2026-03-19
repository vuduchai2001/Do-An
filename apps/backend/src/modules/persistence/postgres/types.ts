import type {
  ProviderType,
  ProviderStatus,
  AccountStatus,
  OAuthSessionStatus,
  RoutingRuleStatus,
  RoutingStrategy,
  ExhaustionReason,
  UsageEventStatus,
} from '../../../core/domain/enums.js';

export interface ProviderRow {
  id: string;
  name: string;
  type: ProviderType;
  status: ProviderStatus;
  models: unknown;
  authorization_url: string | null;
  token_url: string | null;
  device_code_url: string | null;
  scopes: unknown;
  api_base_url: string;
  default_timeout_ms: number;
  max_retries: number;
  created_at: Date;
  updated_at: Date;
}

export interface AccountRow {
  id: string;
  provider_id: string;
  status: AccountStatus;
  access_token: string;
  refresh_token: string | null;
  token_expires_at: Date | null;
  token_scopes: unknown;
  email: string | null;
  name: string | null;
  organization_id: string | null;
  labels: unknown;
  custom_attributes: unknown;
  created_at: Date;
  updated_at: Date;
  last_used_at: Date | null;
  last_refresh_at: Date | null;
}

export interface OAuthSessionRow {
  id: string;
  provider_id: string;
  status: OAuthSessionStatus;
  state: string;
  code_verifier: string | null;
  redirect_uri: string | null;
  access_token: string | null;
  refresh_token: string | null;
  expires_in: number | null;
  token_type: string | null;
  token_scopes: unknown;
  account_id: string | null;
  error_message: string | null;
  created_at: Date;
  expires_at: Date;
  completed_at: Date | null;
}

export interface RoutingRuleRow {
  id: string;
  name: string;
  description: string | null;
  status: RoutingRuleStatus;
  model_pattern: string;
  provider_id: string;
  priority: number;
  strategy: RoutingStrategy;
  constraints: unknown;
  created_at: Date;
  updated_at: Date;
}

export interface QuotaStateRow {
  id: string;
  account_id: string;
  model_id: string;
  exhausted: boolean;
  exhaustion_reason: ExhaustionReason | null;
  exhaustion_message: string | null;
  cooldown_until: Date | null;
  cooldown_reason: string | null;
  limits_requests_per_minute: number | null;
  limits_requests_per_hour: number | null;
  limits_requests_per_day: number | null;
  limits_tokens_per_minute: number | null;
  limits_tokens_per_day: number | null;
  usage_requests_in_minute: number;
  usage_requests_in_hour: number;
  usage_requests_in_day: number;
  usage_tokens_in_minute: number;
  usage_tokens_in_day: number;
  last_checked_at: Date;
  created_at: Date;
  updated_at: Date;
}

export interface UsageEventRow {
  id: string;
  account_id: string;
  provider_id: string;
  status: UsageEventStatus;
  request_model_id: string;
  request_message_count: number;
  request_max_tokens: number | null;
  request_temperature: number | null;
  request_streaming: boolean;
  response_finish_reason: string | null;
  response_http_code: number | null;
  response_provider_request_id: string | null;
  tokens_prompt: number | null;
  tokens_completion: number | null;
  tokens_total: number | null;
  timing_started_at: Date;
  timing_completed_at: Date;
  timing_duration_ms: number;
  timing_time_to_first_token_ms: number | null;
  error_code: string | null;
  error_message: string | null;
  metadata: unknown;
  created_at: Date;
}
