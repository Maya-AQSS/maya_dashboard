import type { AlertAudienceFields } from './alertAudience'
import type { Severity } from './systemNotification'

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
