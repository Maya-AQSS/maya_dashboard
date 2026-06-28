import { Button, Select, TextInput } from '@ceedcv-maya/shared-ui-react'
import { useLocale } from '@ceedcv-maya/shared-i18n-react'
import {
  CONDITION_TABLES,
  OPS_BY_TYPE,
  findField,
  findTable,
  type FieldType,
} from '../data/conditionFieldCatalog'
import type { ConditionItem, ConditionOp, RuleConditions } from '../types/notificationRule'

const NO_VALUE_OPS: ConditionOp[] = ['is_null', 'is_not_null']
const LIST_OPS: ConditionOp[] = ['in', 'not_in']
const DAYS_OPS: ConditionOp[] = ['older_than_days', 'within_days']
const BOOLEAN_VALUES = ['true', 'false']

function emptyItem(): ConditionItem {
  return { table: '', field: '', op: 'eq', value: '' }
}

function defaultConditions(): RuleConditions {
  return { logic: 'AND', items: [emptyItem()] }
}

function rawToValue(op: ConditionOp, type: FieldType, raw: string): ConditionItem['value'] {
  if (NO_VALUE_OPS.includes(op)) return null
  if (LIST_OPS.includes(op)) return raw.split(',').map((s) => s.trim()).filter(Boolean)
  if (DAYS_OPS.includes(op)) return Math.max(0, parseInt(raw, 10) || 0)
  return raw
}

function valueToRaw(value: ConditionItem['value']): string {
  if (value === null || value === undefined) return ''
  if (Array.isArray(value)) return value.join(', ')
  return String(value)
}

interface ConditionRowProps {
  item: ConditionItem
  index: number
  onChange: (patch: Partial<ConditionItem>) => void
  onRemove: () => void
  disabled?: boolean
}

function ConditionRow({ item, index, onChange, onRemove, disabled }: ConditionRowProps) {
  const { t } = useLocale()

  const tableDef = item.table ? findTable(item.table) : undefined
  const fieldDef = item.table && item.field ? findField(item.table, item.field) : undefined
  const availableOps = fieldDef ? OPS_BY_TYPE[fieldDef.type] : ['eq']
  const noValue = NO_VALUE_OPS.includes(item.op as ConditionOp)
  const isList = LIST_OPS.includes(item.op as ConditionOp)
  const isDays = DAYS_OPS.includes(item.op as ConditionOp)
  const isBoolean = fieldDef?.type === 'boolean'
  const isEnum = fieldDef?.type === 'enum'

  const handleTableChange = (tableKey: string) => {
    const firstField = findTable(tableKey)?.fields[0]
    const firstOp = firstField ? OPS_BY_TYPE[firstField.type][0] : 'eq'
    onChange({ table: tableKey, field: firstField?.key ?? '', op: firstOp as ConditionOp, value: '' })
  }

  const handleFieldChange = (fieldKey: string) => {
    const fd = item.table ? findField(item.table, fieldKey) : undefined
    const firstOp = fd ? OPS_BY_TYPE[fd.type][0] : 'eq'
    onChange({ field: fieldKey, op: firstOp as ConditionOp, value: '' })
  }

  const handleOpChange = (op: ConditionOp) => {
    const needsReset = NO_VALUE_OPS.includes(op)
    onChange({ op, value: needsReset ? null : '' })
  }

  const handleValueChange = (raw: string) => {
    const type = fieldDef?.type ?? 'string'
    onChange({ value: rawToValue(item.op as ConditionOp, type, raw) })
  }

  return (
    <div className="rounded-md border border-ui-border dark:border-ui-dark-border p-3 space-y-2 bg-ui-surface dark:bg-ui-dark-surface">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-text-secondary dark:text-text-dark-secondary">
          {t('scheduledRules.conditions.condition')} {index + 1}
        </span>
        <Button variant="outline" size="xs" type="button" onClick={onRemove} disabled={disabled}>
          {t('scheduledRules.conditions.removeCondition')}
        </Button>
      </div>

      {/* Table selector */}
      <div>
        <label className="block text-xs font-medium mb-1 text-text-secondary dark:text-text-dark-secondary">
          {t('scheduledRules.conditions.table')}
        </label>
        <Select
          fieldSize="sm"
          value={item.table}
          onChange={(e) => handleTableChange(e.target.value)}
          disabled={disabled}
        >
          <option value="">— {t('scheduledRules.conditions.selectTable')} —</option>
          {CONDITION_TABLES.map((tbl) => (
            <option key={tbl.key} value={tbl.key}>
              {t(tbl.labelKey)}
            </option>
          ))}
        </Select>
      </div>

      {/* Field selector (only when table selected) */}
      {tableDef && (
        <div>
          <label className="block text-xs font-medium mb-1 text-text-secondary dark:text-text-dark-secondary">
            {t('scheduledRules.conditions.field')}
          </label>
          <Select
            fieldSize="sm"
            value={item.field}
            onChange={(e) => handleFieldChange(e.target.value)}
            disabled={disabled}
          >
            <option value="">— {t('scheduledRules.conditions.selectField')} —</option>
            {tableDef.fields.map((f) => (
              <option key={f.key} value={f.key}>
                {t(f.labelKey)}
              </option>
            ))}
          </Select>
        </div>
      )}

      {/* Operator selector (only when field selected) */}
      {fieldDef && (
        <div>
          <label className="block text-xs font-medium mb-1 text-text-secondary dark:text-text-dark-secondary">
            {t('scheduledRules.conditions.op')}
          </label>
          <Select
            fieldSize="sm"
            value={item.op}
            onChange={(e) => handleOpChange(e.target.value as ConditionOp)}
            disabled={disabled}
          >
            {availableOps.map((op) => (
              <option key={op} value={op}>
                {t(`scheduledRules.conditions.ops.${op}`)}
              </option>
            ))}
          </Select>
        </div>
      )}

      {/* Value input (only when operator is selected and requires a value) */}
      {fieldDef && !noValue && (
        <div>
          <label className="block text-xs font-medium mb-1 text-text-secondary dark:text-text-dark-secondary">
            {t('scheduledRules.conditions.value')}
          </label>

          {/* Boolean: yes/no select */}
          {isBoolean && (
            <Select
              fieldSize="sm"
              value={valueToRaw(item.value)}
              onChange={(e) => onChange({ value: e.target.value })}
              disabled={disabled}
            >
              <option value="true">{t('scheduledRules.conditions.boolTrue')}</option>
              <option value="false">{t('scheduledRules.conditions.boolFalse')}</option>
            </Select>
          )}

          {/* Enum with single value: select from known values */}
          {isEnum && !isList && fieldDef.enumValues && (
            <Select
              fieldSize="sm"
              value={valueToRaw(item.value)}
              onChange={(e) => onChange({ value: e.target.value })}
              disabled={disabled}
            >
              <option value="">—</option>
              {fieldDef.enumValues.map((v) => (
                <option key={v} value={v}>
                  {t(`scheduledRules.catalog.enumValues.${v}`, { fallback: v })}
                </option>
              ))}
            </Select>
          )}

          {/* Days: numeric input */}
          {isDays && (
            <div className="flex items-center gap-2">
              <TextInput
                fieldSize="sm"
                type="number"
                min={0}
                value={valueToRaw(item.value)}
                onChange={(e) => handleValueChange(e.target.value)}
                placeholder={t('scheduledRules.conditions.valuePlaceholderDays')}
                disabled={disabled}
                className="w-32"
              />
              <span className="text-sm text-text-secondary dark:text-text-dark-secondary">
                {t('scheduledRules.conditions.days')}
              </span>
            </div>
          )}

          {/* List: comma-separated input */}
          {isList && (
            <div>
              <TextInput
                fieldSize="sm"
                value={valueToRaw(item.value)}
                onChange={(e) => handleValueChange(e.target.value)}
                placeholder={t('scheduledRules.conditions.valuePlaceholderIn')}
                disabled={disabled}
              />
              <p className="mt-1 text-xs text-text-secondary dark:text-text-dark-secondary">
                {t('scheduledRules.conditions.listHint')}
              </p>
            </div>
          )}

          {/* Text/UUID/number: plain input */}
          {!isBoolean && !isDays && !isList && !(isEnum && fieldDef.enumValues) && (
            <TextInput
              fieldSize="sm"
              value={valueToRaw(item.value)}
              onChange={(e) => handleValueChange(e.target.value)}
              placeholder={t('scheduledRules.conditions.value')}
              disabled={disabled}
            />
          )}
        </div>
      )}
    </div>
  )
}

interface Props {
  value: RuleConditions | null
  onChange: (v: RuleConditions | null) => void
  disabled?: boolean
}

export function ConditionBuilder({ value, onChange, disabled }: Props) {
  const { t } = useLocale()

  const conditions = value ?? defaultConditions()

  const updateLogic = (logic: 'AND' | 'OR') =>
    onChange({ ...conditions, logic })

  const updateItem = (i: number, patch: Partial<ConditionItem>) => {
    const items = conditions.items.map((item, idx) =>
      idx === i ? { ...item, ...patch } : item,
    )
    onChange({ ...conditions, items })
  }

  const addItem = () =>
    onChange({ ...conditions, items: [...conditions.items, emptyItem()] })

  const removeItem = (i: number) => {
    const items = conditions.items.filter((_, idx) => idx !== i)
    onChange(items.length === 0 ? null : { ...conditions, items })
  }

  return (
    <fieldset className="border border-ui-border dark:border-ui-dark-border rounded-md p-3 space-y-3">
      <legend className="px-1 text-sm font-medium text-text-secondary dark:text-text-dark-secondary">
        {t('scheduledRules.conditions.legend')}
      </legend>
      <p className="text-xs text-text-secondary dark:text-text-dark-secondary">
        {t('scheduledRules.conditions.hint')}
      </p>

      {/* Logic selector (only meaningful with 2+ conditions) */}
      {conditions.items.length > 1 && (
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium">{t('scheduledRules.conditions.logic')}:</span>
          {(['AND', 'OR'] as const).map((l) => (
            <label key={l} className="flex items-center gap-1.5 text-sm cursor-pointer">
              <input
                type="radio"
                name={`condition-logic-${Math.random()}`}
                value={l}
                checked={conditions.logic === l}
                onChange={() => updateLogic(l)}
                disabled={disabled}
              />
              <span>
                {l === 'AND'
                  ? t('scheduledRules.conditions.logicAnd')
                  : t('scheduledRules.conditions.logicOr')}
              </span>
            </label>
          ))}
        </div>
      )}

      {/* Condition cards */}
      {conditions.items.map((item, i) => (
        <ConditionRow
          key={i}
          item={item}
          index={i}
          onChange={(patch) => updateItem(i, patch)}
          onRemove={() => removeItem(i)}
          disabled={disabled}
        />
      ))}

      <Button variant="outline" size="xs" type="button" onClick={addItem} disabled={disabled}>
        {t('scheduledRules.conditions.addCondition')}
      </Button>
    </fieldset>
  )
}
