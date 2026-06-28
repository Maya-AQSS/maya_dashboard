import type { AlertAudienceFields } from './alertAudience'
import type { Severity } from './systemNotification'

// ── Condition engine types ───────────────────────────────────────────────────

export type ConditionOp =
  | 'eq' | 'ne'
  | 'gt' | 'lt' | 'gte' | 'lte'
  | 'contains' | 'starts_with' | 'ends_with'
  | 'in' | 'not_in'
  | 'is_null' | 'is_not_null'
  | 'older_than_days' | 'within_days'

export interface ConditionItem {
  table: string
  field: string
  op: ConditionOp
  value?: string | number | string[] | null
}

export interface RuleConditions {
  logic: 'AND' | 'OR'
  items: ConditionItem[]
}

// ── Rule types ───────────────────────────────────────────────────────────────

/**
 * A configurable instance of a scheduled notification rule (level B). The
 * owning service reads its active rules via FDW and evaluates them.
 */
export interface NotificationRule extends AlertAudienceFields {
  id: number
  evaluator_key: string
  source_app: string
  name: string
  description: string | null
  params: Record<string, unknown>
  conditions: RuleConditions | null
  schedule_cron: string
  severity: Severity | null
  enabled: boolean
  created_by: string | null
  created_at: string
  updated_at: string
}

export interface CreateNotificationRuleInput {
  evaluator_key: string
  name: string
  description?: string | null
  params?: Record<string, unknown>
  conditions?: RuleConditions | null
  schedule_cron: string
  severity?: Severity | null
  enabled?: boolean
  notify_all?: boolean
  audience_kind?: 'academic' | 'team'
  academic_level?: 'study_type' | 'study' | 'module'
  audience_study_type_id?: string
  audience_study_id?: string
  audience_module_id?: string
  audience_team_id?: string
}

export type UpdateNotificationRuleInput = Partial<CreateNotificationRuleInput>

export interface PaginatedNotificationRules {
  data: NotificationRule[]
  meta: {
    current_page: number
    last_page: number
    per_page: number
    total: number
    from: number | null
    to: number | null
  }
}
