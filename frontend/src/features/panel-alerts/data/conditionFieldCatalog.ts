/**
 * Static catalog of FDW tables and their fields available for the generic
 * condition engine. Must stay in sync with ConditionCompiler::ALLOWED_TABLES
 * and ConditionOperators in maya_dms.
 *
 * field.type drives which operators and value inputs appear in the UI.
 */

export type FieldType = 'string' | 'enum' | 'boolean' | 'number' | 'timestamp' | 'uuid'

export interface FieldDef {
  key: string
  labelKey: string
  type: FieldType
  enumValues?: string[]
  nullable?: boolean
}

export interface TableDef {
  key: string
  labelKey: string
  fields: FieldDef[]
}

export const CONDITION_TABLES: TableDef[] = [
  {
    key: 'entity_versions',
    labelKey: 'scheduledRules.catalog.tables.entity_versions',
    fields: [
      { key: 'versionable_type', labelKey: 'scheduledRules.catalog.fields.versionable_type', type: 'enum', enumValues: ['Template', 'Document'] },
      { key: 'status', labelKey: 'scheduledRules.catalog.fields.status', type: 'enum', enumValues: ['draft', 'published'] },
      { key: 'version_number', labelKey: 'scheduledRules.catalog.fields.version_number', type: 'number' },
      { key: 'created_by', labelKey: 'scheduledRules.catalog.fields.created_by', type: 'uuid', nullable: true },
      { key: 'published_by', labelKey: 'scheduledRules.catalog.fields.published_by', type: 'uuid', nullable: true },
      { key: 'published_at', labelKey: 'scheduledRules.catalog.fields.published_at', type: 'timestamp', nullable: true },
      { key: 'created_at', labelKey: 'scheduledRules.catalog.fields.created_at', type: 'timestamp' },
      { key: 'updated_at', labelKey: 'scheduledRules.catalog.fields.updated_at', type: 'timestamp' },
    ],
  },
  {
    key: 'document_reviews',
    labelKey: 'scheduledRules.catalog.tables.document_reviews',
    fields: [
      { key: 'status', labelKey: 'scheduledRules.catalog.fields.review_status', type: 'enum', enumValues: ['pending', 'approved', 'rejected'] },
      { key: 'stage', labelKey: 'scheduledRules.catalog.fields.stage', type: 'number' },
      { key: 'reviewer_id', labelKey: 'scheduledRules.catalog.fields.reviewer_id', type: 'uuid' },
      { key: 'reviewed_at', labelKey: 'scheduledRules.catalog.fields.reviewed_at', type: 'timestamp', nullable: true },
      { key: 'created_at', labelKey: 'scheduledRules.catalog.fields.created_at', type: 'timestamp' },
    ],
  },
  {
    key: 'documents',
    labelKey: 'scheduledRules.catalog.tables.documents',
    fields: [
      { key: 'process_id', labelKey: 'scheduledRules.catalog.fields.process_id', type: 'uuid' },
      { key: 'template_id', labelKey: 'scheduledRules.catalog.fields.template_id', type: 'uuid' },
      { key: 'created_at', labelKey: 'scheduledRules.catalog.fields.created_at', type: 'timestamp' },
      { key: 'updated_at', labelKey: 'scheduledRules.catalog.fields.updated_at', type: 'timestamp' },
      { key: 'deleted_at', labelKey: 'scheduledRules.catalog.fields.deleted_at', type: 'timestamp', nullable: true },
    ],
  },
  {
    key: 'document_blocks',
    labelKey: 'scheduledRules.catalog.tables.document_blocks',
    fields: [
      { key: 'is_filled', labelKey: 'scheduledRules.catalog.fields.is_filled', type: 'boolean' },
      { key: 'locked_by', labelKey: 'scheduledRules.catalog.fields.locked_by', type: 'uuid', nullable: true },
      { key: 'locked_at', labelKey: 'scheduledRules.catalog.fields.locked_at', type: 'timestamp', nullable: true },
      { key: 'last_edited_by', labelKey: 'scheduledRules.catalog.fields.last_edited_by', type: 'uuid', nullable: true },
      { key: 'updated_at', labelKey: 'scheduledRules.catalog.fields.updated_at', type: 'timestamp' },
    ],
  },
  {
    key: 'template_reviewers',
    labelKey: 'scheduledRules.catalog.tables.template_reviewers',
    fields: [
      { key: 'status', labelKey: 'scheduledRules.catalog.fields.review_status', type: 'enum', enumValues: ['pending', 'approved', 'rejected'] },
      { key: 'stage', labelKey: 'scheduledRules.catalog.fields.stage', type: 'number' },
      { key: 'user_id', labelKey: 'scheduledRules.catalog.fields.user_id', type: 'uuid' },
      { key: 'created_at', labelKey: 'scheduledRules.catalog.fields.created_at', type: 'timestamp' },
    ],
  },
  {
    key: 'document_shares',
    labelKey: 'scheduledRules.catalog.tables.document_shares',
    fields: [
      { key: 'permission', labelKey: 'scheduledRules.catalog.fields.permission', type: 'enum', enumValues: ['read', 'edit'] },
      { key: 'user_id', labelKey: 'scheduledRules.catalog.fields.user_id', type: 'uuid' },
      { key: 'granted_by', labelKey: 'scheduledRules.catalog.fields.granted_by', type: 'uuid' },
      { key: 'created_at', labelKey: 'scheduledRules.catalog.fields.created_at', type: 'timestamp' },
    ],
  },
  {
    key: 'themes',
    labelKey: 'scheduledRules.catalog.tables.themes',
    fields: [
      { key: 'status', labelKey: 'scheduledRules.catalog.fields.theme_status', type: 'enum', enumValues: ['draft', 'published', 'archived'] },
      { key: 'is_system', labelKey: 'scheduledRules.catalog.fields.is_system', type: 'boolean' },
      { key: 'created_by', labelKey: 'scheduledRules.catalog.fields.created_by', type: 'uuid' },
      { key: 'created_at', labelKey: 'scheduledRules.catalog.fields.created_at', type: 'timestamp' },
      { key: 'deleted_at', labelKey: 'scheduledRules.catalog.fields.deleted_at', type: 'timestamp', nullable: true },
    ],
  },
  {
    key: 'comments',
    labelKey: 'scheduledRules.catalog.tables.comments',
    fields: [
      { key: 'commentable_type', labelKey: 'scheduledRules.catalog.fields.commentable_type', type: 'enum', enumValues: ['Template', 'Document'] },
      { key: 'author_id', labelKey: 'scheduledRules.catalog.fields.author_id', type: 'uuid' },
      { key: 'created_at', labelKey: 'scheduledRules.catalog.fields.created_at', type: 'timestamp' },
      { key: 'deleted_at', labelKey: 'scheduledRules.catalog.fields.deleted_at', type: 'timestamp', nullable: true },
    ],
  },
  {
    key: 'anchored_comments',
    labelKey: 'scheduledRules.catalog.tables.anchored_comments',
    fields: [
      { key: 'anchor_is_valid', labelKey: 'scheduledRules.catalog.fields.anchor_is_valid', type: 'boolean' },
      { key: 'anchor_last_synced_at', labelKey: 'scheduledRules.catalog.fields.anchor_last_synced_at', type: 'timestamp', nullable: true },
      { key: 'created_at', labelKey: 'scheduledRules.catalog.fields.created_at', type: 'timestamp' },
    ],
  },
]

export function findTable(key: string): TableDef | undefined {
  return CONDITION_TABLES.find((t) => t.key === key)
}

export function findField(tableKey: string, fieldKey: string): FieldDef | undefined {
  return findTable(tableKey)?.fields.find((f) => f.key === fieldKey)
}

// Operators available per field type
export const OPS_BY_TYPE: Record<FieldType, string[]> = {
  string:    ['eq', 'ne', 'contains', 'starts_with', 'ends_with', 'in', 'not_in', 'is_null', 'is_not_null'],
  enum:      ['eq', 'ne', 'in', 'not_in', 'is_null', 'is_not_null'],
  boolean:   ['eq', 'is_null', 'is_not_null'],
  number:    ['eq', 'ne', 'gt', 'lt', 'gte', 'lte', 'is_null', 'is_not_null'],
  timestamp: ['older_than_days', 'within_days', 'is_null', 'is_not_null'],
  uuid:      ['eq', 'ne', 'in', 'not_in', 'is_null', 'is_not_null'],
}
