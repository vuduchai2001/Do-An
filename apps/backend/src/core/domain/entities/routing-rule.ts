/**
 * Routing Rule entity - defines how requests are routed to providers.
 */
import type { RoutingRuleId, ProviderId, ModelId } from '../ids.js';
import type { RoutingRuleStatus, RoutingStrategy } from '../enums.js';

export interface RoutingRuleConstraints {
  minHealthScore?: number;
  requireNotExhausted?: boolean;
  requireNotInCooldown?: boolean;
  excludeAccountIds?: string[];
  preferAccountId?: string;
}

export interface RoutingRule {
  id: RoutingRuleId;
  name: string;
  description?: string;
  status: RoutingRuleStatus;
  
  modelPattern: string;
  providerId: ProviderId;
  priority: number;
  strategy: RoutingStrategy;
  
  constraints?: RoutingRuleConstraints;
  
  createdAt: Date;
  updatedAt: Date;
}

export interface RoutingRuleCreateInput {
  name: string;
  description?: string;
  modelPattern: string;
  providerId: ProviderId;
  priority: number;
  strategy?: RoutingStrategy;
  constraints?: RoutingRuleConstraints;
}

export interface RoutingRuleUpdateInput {
  name?: string;
  description?: string;
  status?: RoutingRuleStatus;
  modelPattern?: string;
  providerId?: ProviderId;
  priority?: number;
  strategy?: RoutingStrategy;
  constraints?: RoutingRuleConstraints;
}
