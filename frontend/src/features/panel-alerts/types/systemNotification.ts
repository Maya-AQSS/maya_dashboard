export type Severity = 'critical' | 'high' | 'medium' | 'low' | 'info'

export type DefinitionCategory = 'event' | 'scheduled'

/**
 * A system notification type from the catalog (notification_definitions).
 * Admins enable/disable each one; the toggle is enforced at ingestion.
 */
export interface NotificationDefinition {
  id: number
  key: string
  source_app: string
  category: DefinitionCategory
  label: string
  description: string | null
  enabled: boolean
  default_severity: Severity
  title_key: string
  body_key: string
  url_template: string | null
  schedule_cron: string | null
  last_evaluated_at: string | null
}
