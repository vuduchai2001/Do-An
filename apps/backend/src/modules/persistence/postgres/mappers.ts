import { AccountId, ProviderId, SessionId, ModelId } from '../../../core/domain/ids.js';
import type {
  Account,
  AccountCreateInput,
  AccountUpdateInput,
} from '../../../core/domain/entities/account.js';
import type {
  Provider,
  ProviderCreateInput,
  ProviderUpdateInput,
} from '../../../core/domain/entities/provider.js';
import type {
  OAuthSession,
  OAuthSessionCreateInput,
} from '../../../core/domain/entities/oauth-session.js';
import type {
  RoutingRule,
  RoutingRuleCreateInput,
  RoutingRuleUpdateInput,
} from '../../../core/domain/entities/routing-rule.js';
import type {
  QuotaState,
  QuotaStateCreateInput,
} from '../../../core/domain/entities/quota-state.js';
import type {
  UsageEvent,
  UsageEventCreateInput,
} from '../../../core/domain/entities/usage-event.js';
import type {
  AccountRecord,
  ProviderRecord,
  OAuthSessionRecord,
  RoutingRuleRecord,
  QuotaStateRecord,
  UsageEventRecord,
} from '../records.js';
import type {
  AccountRow,
  ProviderRow,
  OAuthSessionRow,
  RoutingRuleRow,
  QuotaStateRow,
  UsageEventRow,
} from './types.js';

function asStringArray(value: unknown): string[] | undefined {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === 'string')
    : undefined;
}

function asRecord(value: unknown): Record<string, unknown> | undefined {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : undefined;
}

function asProviderModels(value: unknown): Provider['models'] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.map((item) => {
    const model = item as Record<string, unknown>;
    return {
      id: ModelId.create(String(model.id)),
      alias: typeof model.alias === 'string' ? model.alias : undefined,
      supportsStreaming: Boolean(model.supportsStreaming),
      supportsVision: Boolean(model.supportsVision),
      supportsFunctionCalling: Boolean(model.supportsFunctionCalling),
      maxTokens: Number(model.maxTokens ?? 0),
      inputCostPer1k: typeof model.inputCostPer1k === 'number' ? model.inputCostPer1k : undefined,
      outputCostPer1k:
        typeof model.outputCostPer1k === 'number' ? model.outputCostPer1k : undefined,
    };
  });
}

export function providerRowToRecord(row: ProviderRow): ProviderRecord {
  return {
    id: ProviderId.create(row.id),
    name: row.name,
    type: row.type,
    status: row.status,
    models: JSON.stringify(row.models ?? []),
    authorizationUrl: row.authorization_url ?? undefined,
    tokenUrl: row.token_url ?? undefined,
    deviceCodeUrl: row.device_code_url ?? undefined,
    scopes: row.scopes ? JSON.stringify(row.scopes) : undefined,
    apiBaseUrl: row.api_base_url,
    defaultTimeoutMs: row.default_timeout_ms,
    maxRetries: row.max_retries,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function providerRecordToDomain(record: ProviderRecord): Provider {
  return {
    id: record.id,
    name: record.name,
    type: record.type,
    status: record.status,
    models: asProviderModels(record.models ? JSON.parse(record.models) : []),
    config: {
      authorizationUrl: record.authorizationUrl,
      tokenUrl: record.tokenUrl,
      deviceCodeUrl: record.deviceCodeUrl,
      scopes: record.scopes ? asStringArray(JSON.parse(record.scopes)) : undefined,
      apiBaseUrl: record.apiBaseUrl,
      defaultTimeoutMs: record.defaultTimeoutMs,
      maxRetries: record.maxRetries,
    },
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  };
}

export function providerCreateInputToRecord(
  input: ProviderCreateInput,
): Omit<ProviderRecord, 'status' | 'createdAt' | 'updatedAt'> {
  return {
    id: input.id,
    name: input.name,
    type: input.type,
    models: JSON.stringify(input.models ?? []),
    authorizationUrl: input.config.authorizationUrl,
    tokenUrl: input.config.tokenUrl,
    deviceCodeUrl: input.config.deviceCodeUrl,
    scopes: input.config.scopes ? JSON.stringify(input.config.scopes) : undefined,
    apiBaseUrl: input.config.apiBaseUrl,
    defaultTimeoutMs: input.config.defaultTimeoutMs,
    maxRetries: input.config.maxRetries,
  };
}

export function providerUpdateInputToRecord(input: ProviderUpdateInput): Partial<ProviderRecord> {
  return {
    name: input.name,
    status: input.status,
    models: input.models ? JSON.stringify(input.models) : undefined,
    authorizationUrl: input.config?.authorizationUrl,
    tokenUrl: input.config?.tokenUrl,
    deviceCodeUrl: input.config?.deviceCodeUrl,
    scopes: input.config?.scopes ? JSON.stringify(input.config.scopes) : undefined,
    apiBaseUrl: input.config?.apiBaseUrl,
    defaultTimeoutMs: input.config?.defaultTimeoutMs,
    maxRetries: input.config?.maxRetries,
  };
}

export function accountRowToRecord(row: AccountRow): AccountRecord {
  return {
    id: AccountId.create(row.id),
    providerId: ProviderId.create(row.provider_id),
    status: row.status,
    accessToken: row.access_token,
    refreshToken: row.refresh_token ?? undefined,
    tokenExpiresAt: row.token_expires_at ?? undefined,
    tokenScopes: asStringArray(row.token_scopes),
    email: row.email ?? undefined,
    name: row.name ?? undefined,
    organizationId: row.organization_id ?? undefined,
    labels: asStringArray(row.labels),
    customAttributes: row.custom_attributes ? JSON.stringify(row.custom_attributes) : undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    lastUsedAt: row.last_used_at ?? undefined,
    lastRefreshAt: row.last_refresh_at ?? undefined,
  };
}

export function accountRecordToDomain(record: AccountRecord): Account {
  return {
    id: record.id,
    providerId: record.providerId,
    status: record.status,
    credentials: {
      accessToken: record.accessToken,
      refreshToken: record.refreshToken,
      expiresAt: record.tokenExpiresAt,
      scopes: record.tokenScopes,
    },
    metadata: {
      email: record.email,
      name: record.name,
      organizationId: record.organizationId,
      labels: record.labels,
      customAttributes: record.customAttributes
        ? asRecord(JSON.parse(record.customAttributes))
        : undefined,
    },
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
    lastUsedAt: record.lastUsedAt,
    lastRefreshAt: record.lastRefreshAt,
  };
}

export function accountCreateInputToRecord(
  input: AccountCreateInput,
): Omit<
  AccountRecord,
  'id' | 'status' | 'createdAt' | 'updatedAt' | 'lastUsedAt' | 'lastRefreshAt'
> {
  return {
    providerId: input.providerId,
    accessToken: input.credentials.accessToken,
    refreshToken: input.credentials.refreshToken,
    tokenExpiresAt: input.credentials.expiresAt,
    tokenScopes: input.credentials.scopes,
    email: input.metadata?.email,
    name: input.metadata?.name,
    organizationId: input.metadata?.organizationId,
    labels: input.metadata?.labels,
    customAttributes: input.metadata?.customAttributes
      ? JSON.stringify(input.metadata.customAttributes)
      : undefined,
  };
}

export function accountUpdateInputToRecord(input: AccountUpdateInput): Partial<AccountRecord> {
  return {
    status: input.status,
    accessToken: input.credentials?.accessToken,
    refreshToken: input.credentials?.refreshToken,
    tokenExpiresAt: input.credentials?.expiresAt,
    tokenScopes: input.credentials?.scopes,
    email: input.metadata?.email,
    name: input.metadata?.name,
    organizationId: input.metadata?.organizationId,
    labels: input.metadata?.labels,
    customAttributes: input.metadata?.customAttributes
      ? JSON.stringify(input.metadata.customAttributes)
      : undefined,
  };
}

export function oauthSessionRowToRecord(row: OAuthSessionRow): OAuthSessionRecord {
  return {
    id: SessionId.create(row.id),
    providerId: ProviderId.create(row.provider_id),
    status: row.status,
    state: row.state,
    codeVerifier: row.code_verifier ?? undefined,
    redirectUri: row.redirect_uri ?? undefined,
    accessToken: row.access_token ?? undefined,
    refreshToken: row.refresh_token ?? undefined,
    expiresIn: row.expires_in ?? undefined,
    tokenType: row.token_type ?? undefined,
    tokenScopes: row.token_scopes ? JSON.stringify(row.token_scopes) : undefined,
    accountId: row.account_id ? AccountId.create(row.account_id) : undefined,
    errorMessage: row.error_message ?? undefined,
    createdAt: row.created_at,
    expiresAt: row.expires_at,
    completedAt: row.completed_at ?? undefined,
  };
}

export function oauthSessionRecordToDomain(record: OAuthSessionRecord): OAuthSession {
  return {
    id: record.id,
    providerId: record.providerId,
    status: record.status,
    state: record.state,
    codeVerifier: record.codeVerifier,
    redirectUri: record.redirectUri,
    tokens:
      record.accessToken && record.tokenType
        ? {
            accessToken: record.accessToken,
            refreshToken: record.refreshToken,
            expiresIn: record.expiresIn,
            tokenType: record.tokenType,
            scopes: record.tokenScopes ? asStringArray(JSON.parse(record.tokenScopes)) : undefined,
          }
        : undefined,
    accountId: record.accountId,
    errorMessage: record.errorMessage,
    createdAt: record.createdAt,
    expiresAt: record.expiresAt,
    completedAt: record.completedAt,
  };
}

export function oauthSessionCreateInputToRecord(
  input: OAuthSessionCreateInput,
): Omit<OAuthSessionRecord, 'id' | 'status' | 'createdAt' | 'expiresAt' | 'completedAt'> {
  return {
    providerId: input.providerId,
    state: input.state,
    codeVerifier: input.codeVerifier,
    redirectUri: input.redirectUri,
  };
}

export function oauthSessionUpdateToRecord(
  updates: Partial<OAuthSession>,
): Partial<OAuthSessionRecord> {
  return {
    status: updates.status,
    state: updates.state,
    codeVerifier: updates.codeVerifier,
    redirectUri: updates.redirectUri,
    accessToken: updates.tokens?.accessToken,
    refreshToken: updates.tokens?.refreshToken,
    expiresIn: updates.tokens?.expiresIn,
    tokenType: updates.tokens?.tokenType,
    tokenScopes: updates.tokens?.scopes ? JSON.stringify(updates.tokens.scopes) : undefined,
    accountId: updates.accountId,
    errorMessage: updates.errorMessage,
    expiresAt: updates.expiresAt,
    completedAt: updates.completedAt,
  };
}

export function routingRuleRowToRecord(row: RoutingRuleRow): RoutingRuleRecord {
  return {
    id: row.id as RoutingRuleRecord['id'],
    name: row.name,
    description: row.description ?? undefined,
    status: row.status,
    modelPattern: row.model_pattern,
    providerId: ProviderId.create(row.provider_id),
    priority: row.priority,
    strategy: row.strategy,
    constraints: row.constraints ? JSON.stringify(row.constraints) : undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function routingRuleRecordToDomain(record: RoutingRuleRecord): RoutingRule {
  return {
    id: record.id,
    name: record.name,
    description: record.description,
    status: record.status,
    modelPattern: record.modelPattern,
    providerId: record.providerId,
    priority: record.priority,
    strategy: record.strategy,
    constraints: record.constraints
      ? (JSON.parse(record.constraints) as RoutingRule['constraints'])
      : undefined,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  };
}

export function routingRuleCreateInputToRecord(
  input: RoutingRuleCreateInput,
): Omit<RoutingRuleRecord, 'id' | 'status' | 'createdAt' | 'updatedAt'> {
  return {
    name: input.name,
    description: input.description,
    modelPattern: input.modelPattern,
    providerId: input.providerId,
    priority: input.priority,
    strategy: input.strategy ?? 'round-robin',
    constraints: input.constraints ? JSON.stringify(input.constraints) : undefined,
  };
}

export function routingRuleUpdateInputToRecord(
  input: RoutingRuleUpdateInput,
): Partial<RoutingRuleRecord> {
  return {
    name: input.name,
    description: input.description,
    status: input.status,
    modelPattern: input.modelPattern,
    providerId: input.providerId,
    priority: input.priority,
    strategy: input.strategy,
    constraints: input.constraints ? JSON.stringify(input.constraints) : undefined,
  };
}

export function quotaStateRowToRecord(row: QuotaStateRow): QuotaStateRecord {
  return {
    id: row.id as QuotaStateRecord['id'],
    accountId: AccountId.create(row.account_id),
    modelId: ModelId.create(row.model_id),
    exhausted: row.exhausted,
    exhaustionReason: row.exhaustion_reason ?? undefined,
    exhaustionMessage: row.exhaustion_message ?? undefined,
    cooldownUntil: row.cooldown_until ?? undefined,
    cooldownReason: row.cooldown_reason ?? undefined,
    limitsRequestsPerMinute: row.limits_requests_per_minute ?? undefined,
    limitsRequestsPerHour: row.limits_requests_per_hour ?? undefined,
    limitsRequestsPerDay: row.limits_requests_per_day ?? undefined,
    limitsTokensPerMinute: row.limits_tokens_per_minute ?? undefined,
    limitsTokensPerDay: row.limits_tokens_per_day ?? undefined,
    usageRequestsInMinute: row.usage_requests_in_minute,
    usageRequestsInHour: row.usage_requests_in_hour,
    usageRequestsInDay: row.usage_requests_in_day,
    usageTokensInMinute: row.usage_tokens_in_minute,
    usageTokensInDay: row.usage_tokens_in_day,
    lastCheckedAt: row.last_checked_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function quotaStateRecordToDomain(record: QuotaStateRecord): QuotaState {
  return {
    id: record.id,
    accountId: record.accountId,
    modelId: record.modelId,
    exhausted: record.exhausted,
    exhaustionReason: record.exhaustionReason,
    exhaustionMessage: record.exhaustionMessage,
    cooldownUntil: record.cooldownUntil,
    cooldownReason: record.cooldownReason,
    limits: {
      requestsPerMinute: record.limitsRequestsPerMinute,
      requestsPerHour: record.limitsRequestsPerHour,
      requestsPerDay: record.limitsRequestsPerDay,
      tokensPerMinute: record.limitsTokensPerMinute,
      tokensPerDay: record.limitsTokensPerDay,
    },
    usage: {
      requestsInMinute: record.usageRequestsInMinute,
      requestsInHour: record.usageRequestsInHour,
      requestsInDay: record.usageRequestsInDay,
      tokensInMinute: record.usageTokensInMinute,
      tokensInDay: record.usageTokensInDay,
    },
    lastCheckedAt: record.lastCheckedAt,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  };
}

export function quotaStateCreateInputToRecord(
  input: QuotaStateCreateInput,
): Omit<
  QuotaStateRecord,
  | 'id'
  | 'exhausted'
  | 'usageRequestsInMinute'
  | 'usageRequestsInHour'
  | 'usageRequestsInDay'
  | 'usageTokensInMinute'
  | 'usageTokensInDay'
  | 'lastCheckedAt'
  | 'createdAt'
  | 'updatedAt'
> {
  return {
    accountId: input.accountId,
    modelId: input.modelId,
    limitsRequestsPerMinute: input.limits?.requestsPerMinute,
    limitsRequestsPerHour: input.limits?.requestsPerHour,
    limitsRequestsPerDay: input.limits?.requestsPerDay,
    limitsTokensPerMinute: input.limits?.tokensPerMinute,
    limitsTokensPerDay: input.limits?.tokensPerDay,
  };
}

export function quotaStateUpdateToRecord(updates: Partial<QuotaState>): Partial<QuotaStateRecord> {
  return {
    exhausted: updates.exhausted,
    exhaustionReason: updates.exhaustionReason,
    exhaustionMessage: updates.exhaustionMessage,
    cooldownUntil: updates.cooldownUntil,
    cooldownReason: updates.cooldownReason,
    limitsRequestsPerMinute: updates.limits?.requestsPerMinute,
    limitsRequestsPerHour: updates.limits?.requestsPerHour,
    limitsRequestsPerDay: updates.limits?.requestsPerDay,
    limitsTokensPerMinute: updates.limits?.tokensPerMinute,
    limitsTokensPerDay: updates.limits?.tokensPerDay,
    usageRequestsInMinute: updates.usage?.requestsInMinute,
    usageRequestsInHour: updates.usage?.requestsInHour,
    usageRequestsInDay: updates.usage?.requestsInDay,
    usageTokensInMinute: updates.usage?.tokensInMinute,
    usageTokensInDay: updates.usage?.tokensInDay,
    lastCheckedAt: updates.lastCheckedAt,
  };
}

export function usageEventRowToRecord(row: UsageEventRow): UsageEventRecord {
  return {
    id: row.id as UsageEventRecord['id'],
    accountId: AccountId.create(row.account_id),
    providerId: ProviderId.create(row.provider_id),
    status: row.status,
    requestModelId: ModelId.create(row.request_model_id),
    requestMessageCount: row.request_message_count,
    requestMaxTokens: row.request_max_tokens ?? undefined,
    requestTemperature: row.request_temperature ?? undefined,
    requestStreaming: row.request_streaming,
    responseFinishReason: row.response_finish_reason ?? undefined,
    responseHttpCode: row.response_http_code ?? undefined,
    responseProviderRequestId: row.response_provider_request_id ?? undefined,
    tokensPrompt: row.tokens_prompt ?? undefined,
    tokensCompletion: row.tokens_completion ?? undefined,
    tokensTotal: row.tokens_total ?? undefined,
    timingStartedAt: row.timing_started_at,
    timingCompletedAt: row.timing_completed_at,
    timingDurationMs: row.timing_duration_ms,
    timingTimeToFirstTokenMs: row.timing_time_to_first_token_ms ?? undefined,
    errorCode: row.error_code ?? undefined,
    errorMessage: row.error_message ?? undefined,
    metadata: row.metadata ? JSON.stringify(row.metadata) : undefined,
    createdAt: row.created_at,
  };
}

export function usageEventRecordToDomain(record: UsageEventRecord): UsageEvent {
  return {
    id: record.id,
    accountId: record.accountId,
    providerId: record.providerId,
    status: record.status,
    request: {
      modelId: record.requestModelId,
      messageCount: record.requestMessageCount,
      maxTokens: record.requestMaxTokens,
      temperature: record.requestTemperature,
      streaming: record.requestStreaming,
    },
    response:
      record.responseFinishReason || record.responseHttpCode || record.responseProviderRequestId
        ? {
            finishReason: record.responseFinishReason,
            httpResponseCode: record.responseHttpCode,
            providerRequestId: record.responseProviderRequestId,
          }
        : undefined,
    tokens:
      record.tokensPrompt !== undefined ||
      record.tokensCompletion !== undefined ||
      record.tokensTotal !== undefined
        ? {
            promptTokens: record.tokensPrompt ?? 0,
            completionTokens: record.tokensCompletion ?? 0,
            totalTokens: record.tokensTotal ?? 0,
          }
        : undefined,
    timing: {
      startedAt: record.timingStartedAt,
      completedAt: record.timingCompletedAt,
      durationMs: record.timingDurationMs,
      timeToFirstTokenMs: record.timingTimeToFirstTokenMs,
    },
    errorCode: record.errorCode,
    errorMessage: record.errorMessage,
    metadata: record.metadata ? asRecord(JSON.parse(record.metadata)) : undefined,
    createdAt: record.createdAt,
  };
}

export function usageEventCreateInputToRecord(
  input: UsageEventCreateInput,
): Omit<UsageEventRecord, 'id' | 'status' | 'createdAt'> {
  return {
    accountId: input.accountId,
    providerId: input.providerId,
    requestModelId: input.request.modelId,
    requestMessageCount: input.request.messageCount,
    requestMaxTokens: input.request.maxTokens,
    requestTemperature: input.request.temperature,
    requestStreaming: input.request.streaming,
    timingStartedAt: input.timing.startedAt,
    timingCompletedAt: input.timing.completedAt,
    timingDurationMs: input.timing.durationMs,
    timingTimeToFirstTokenMs: input.timing.timeToFirstTokenMs,
    metadata: input.metadata ? JSON.stringify(input.metadata) : undefined,
  };
}

export function usageEventUpdateToRecord(updates: Partial<UsageEvent>): Partial<UsageEventRecord> {
  return {
    status: updates.status,
    requestModelId: updates.request?.modelId,
    requestMessageCount: updates.request?.messageCount,
    requestMaxTokens: updates.request?.maxTokens,
    requestTemperature: updates.request?.temperature,
    requestStreaming: updates.request?.streaming,
    responseFinishReason: updates.response?.finishReason,
    responseHttpCode: updates.response?.httpResponseCode,
    responseProviderRequestId: updates.response?.providerRequestId,
    tokensPrompt: updates.tokens?.promptTokens,
    tokensCompletion: updates.tokens?.completionTokens,
    tokensTotal: updates.tokens?.totalTokens,
    timingStartedAt: updates.timing?.startedAt,
    timingCompletedAt: updates.timing?.completedAt,
    timingDurationMs: updates.timing?.durationMs,
    timingTimeToFirstTokenMs: updates.timing?.timeToFirstTokenMs,
    errorCode: updates.errorCode,
    errorMessage: updates.errorMessage,
    metadata: updates.metadata ? JSON.stringify(updates.metadata) : undefined,
  };
}
