import type { AlertAudienceFields } from './alertAudience'

export type Severity = 'critical' | 'high' | 'medium' | 'low' | 'info'
export type AlertSource = 'manual' | 'scheduled'

export interface PanelAlert extends AlertAudienceFields {
  id: number
  text: string
  severity: Severity
  action_label: string | null
  action_url: string | null
  visible_from: string
  visible_until: string | null
  schedule_cron: string | null
  duration_minutes: number | null
  last_materialized_at: string | null
  source: AlertSource
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
  sort_by?: 'visible_from' | 'visible_until' | 'created_at' | 'severity'
  sort_dir?: 'asc' | 'desc'
}

export interface CreatePanelAlertInput {
  text: string
  severity: Severity
  action_label?: string | null
  action_url?: string | null
  visible_from: string
  visible_until?: string | null
  schedule_cron?: string | null
  duration_minutes?: number | null
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
