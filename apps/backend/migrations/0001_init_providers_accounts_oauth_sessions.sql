CREATE TABLE IF NOT EXISTS schema_migrations (
  version TEXT PRIMARY KEY,
  applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS providers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  status TEXT NOT NULL,
  models JSONB NOT NULL DEFAULT '[]'::jsonb,
  authorization_url TEXT,
  token_url TEXT,
  device_code_url TEXT,
  scopes JSONB,
  api_base_url TEXT NOT NULL,
  default_timeout_ms INTEGER NOT NULL,
  max_retries INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL
);

CREATE TABLE IF NOT EXISTS accounts (
  id TEXT PRIMARY KEY,
  provider_id TEXT NOT NULL REFERENCES providers(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  token_expires_at TIMESTAMPTZ,
  token_scopes JSONB,
  email TEXT,
  name TEXT,
  organization_id TEXT,
  labels JSONB,
  custom_attributes JSONB,
  created_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL,
  last_used_at TIMESTAMPTZ,
  last_refresh_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_accounts_provider_id ON accounts(provider_id);
CREATE INDEX IF NOT EXISTS idx_accounts_status ON accounts(status);

CREATE TABLE IF NOT EXISTS oauth_sessions (
  id TEXT PRIMARY KEY,
  provider_id TEXT NOT NULL REFERENCES providers(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  state TEXT NOT NULL UNIQUE,
  code_verifier TEXT,
  redirect_uri TEXT,
  access_token TEXT,
  refresh_token TEXT,
  expires_in INTEGER,
  token_type TEXT,
  token_scopes JSONB,
  account_id TEXT REFERENCES accounts(id) ON DELETE SET NULL,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  completed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_oauth_sessions_provider_id ON oauth_sessions(provider_id);
CREATE INDEX IF NOT EXISTS idx_oauth_sessions_status ON oauth_sessions(status);
CREATE INDEX IF NOT EXISTS idx_oauth_sessions_expires_at ON oauth_sessions(expires_at);

CREATE TABLE IF NOT EXISTS routing_rules (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL,
  model_pattern TEXT NOT NULL,
  provider_id TEXT NOT NULL REFERENCES providers(id) ON DELETE CASCADE,
  priority INTEGER NOT NULL,
  strategy TEXT NOT NULL,
  constraints JSONB,
  created_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_routing_rules_provider_id ON routing_rules(provider_id);
CREATE INDEX IF NOT EXISTS idx_routing_rules_status ON routing_rules(status);
CREATE INDEX IF NOT EXISTS idx_routing_rules_priority ON routing_rules(priority DESC);

CREATE TABLE IF NOT EXISTS quota_states (
  id TEXT PRIMARY KEY,
  account_id TEXT NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  model_id TEXT NOT NULL,
  exhausted BOOLEAN NOT NULL,
  exhaustion_reason TEXT,
  exhaustion_message TEXT,
  cooldown_until TIMESTAMPTZ,
  cooldown_reason TEXT,
  limits_requests_per_minute INTEGER,
  limits_requests_per_hour INTEGER,
  limits_requests_per_day INTEGER,
  limits_tokens_per_minute INTEGER,
  limits_tokens_per_day INTEGER,
  usage_requests_in_minute INTEGER NOT NULL,
  usage_requests_in_hour INTEGER NOT NULL,
  usage_requests_in_day INTEGER NOT NULL,
  usage_tokens_in_minute INTEGER NOT NULL,
  usage_tokens_in_day INTEGER NOT NULL,
  last_checked_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL,
  UNIQUE(account_id, model_id)
);

CREATE INDEX IF NOT EXISTS idx_quota_states_account_id ON quota_states(account_id);
CREATE INDEX IF NOT EXISTS idx_quota_states_exhausted ON quota_states(exhausted);
CREATE INDEX IF NOT EXISTS idx_quota_states_cooldown_until ON quota_states(cooldown_until);

CREATE TABLE IF NOT EXISTS usage_events (
  id TEXT PRIMARY KEY,
  account_id TEXT NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  provider_id TEXT NOT NULL REFERENCES providers(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  request_model_id TEXT NOT NULL,
  request_message_count INTEGER NOT NULL,
  request_max_tokens INTEGER,
  request_temperature DOUBLE PRECISION,
  request_streaming BOOLEAN NOT NULL,
  response_finish_reason TEXT,
  response_http_code INTEGER,
  response_provider_request_id TEXT,
  tokens_prompt INTEGER,
  tokens_completion INTEGER,
  tokens_total INTEGER,
  timing_started_at TIMESTAMPTZ NOT NULL,
  timing_completed_at TIMESTAMPTZ NOT NULL,
  timing_duration_ms INTEGER NOT NULL,
  timing_time_to_first_token_ms INTEGER,
  error_code TEXT,
  error_message TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_usage_events_account_id ON usage_events(account_id);
CREATE INDEX IF NOT EXISTS idx_usage_events_provider_id ON usage_events(provider_id);
CREATE INDEX IF NOT EXISTS idx_usage_events_created_at ON usage_events(created_at DESC);
