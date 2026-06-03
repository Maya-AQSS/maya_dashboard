import type { AlertAudienceFields } from './alertAudience'

export type Severity = 'critical' | 'high' | 'medium' | 'low'
export type AlertSource = 'manual' | 'rule'

export interface PanelAlert extends AlertAudienceFields {
  id: number
  text: string
  severity: Severity
  action_label: string | null
  action_url: string | null
  visible_from: string
  visible_until: string | null
  source: AlertSource
  rule_id: number | null
  created_by: string
  created_at: string
  updated_at: string
}

export interface PanelAlertFilters {
  page?: number
  per_page?: number
  severity?: Severity
  search?: string
  include_expired?: boolean
  sort_by?: 'visible_from' | 'created_at' | 'severity'
  sort_dir?: 'asc' | 'desc'
}

export interface CreatePanelAlertInput {
  text: string
  severity: Severity
  action_label?: string | null
  action_url?: string | null
  visible_from: string
  visible_until?: string | null
  notify_all?: boolean
  audience_kind?: 'academic' | 'team'
  academic_level?: 'study_type' | 'study' | 'module'
  audience_study_type_id?: string
  audience_study_id?: string
  audience_module_id?: string
  audience_team_id?: string
}

export type UpdatePanelAlertInput = Partial<CreatePanelAlertInput>

export interface PaginatedPanelAlerts {
  data: PanelAlert[]
  meta: {
    current_page: number
    last_page: number
    per_page: number
    total: number
    from: number | null
    to: number | null
  }
}

export interface AlertCondition {
  key: string
  operator: string
  value: string
}

export interface PanelAlertRule extends AlertAudienceFields {
  id: number
  name: string
  description: string | null
  event_type: string
  conditions: AlertCondition[] | null
  alert_text: string
  severity: Severity
  action_label: string | null
  action_url: string | null
  visible_duration_hours: number | null
  max_frequency_minutes: number | null
  is_active: boolean
  last_triggered_at: string | null
  created_by: string
  created_at: string
  updated_at: string
}

export interface CreatePanelAlertRuleInput {
  name: string
  description?: string | null
  event_type: string
  conditions?: AlertCondition[] | null
  alert_text: string
  severity: Severity
  action_label?: string | null
  action_url?: string | null
  visible_duration_hours?: number | null
  max_frequency_minutes?: number | null
  is_active?: boolean
  notify_all?: boolean
  audience_kind?: 'academic' | 'team'
  academic_level?: 'study_type' | 'study' | 'module'
  audience_study_type_id?: string
  audience_study_id?: string
  audience_module_id?: string
  audience_team_id?: string
}

export type UpdatePanelAlertRuleInput = Partial<CreatePanelAlertRuleInput>

export interface PaginatedPanelAlertRules {
  data: PanelAlertRule[]
  meta: {
    current_page: number
    last_page: number
    per_page: number
    total: number
    from: number | null
    to: number | null
  }
}
