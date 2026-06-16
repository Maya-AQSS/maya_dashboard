import { Button, Select, TextInput } from '@ceedcv-maya/shared-ui-react'
import { useLocale } from '@ceedcv-maya/shared-i18n-react'
import type { ConditionItem, ConditionOp, RuleConditions } from '../types/notificationRule'

const ALL_OPS: ConditionOp[] = [
  'eq', 'ne', 'gt', 'lt', 'gte', 'lte',
  'contains', 'starts_with', 'ends_with',
  'in', 'not_in',
  'is_null', 'is_not_null',
  'older_than_days', 'within_days',
]

const NO_VALUE_OPS: ConditionOp[] = ['is_null', 'is_not_null']
const LIST_OPS: ConditionOp[] = ['in', 'not_in']
const DAYS_OPS: ConditionOp[] = ['older_than_days', 'within_days']

function emptyItem(): ConditionItem {
  return { table: '', field: '', op: 'eq', value: '' }
}

function defaultConditions(): RuleConditions {
  return { logic: 'AND', items: [emptyItem()] }
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
    if (items.length === 0) {
      onChange(null)
    } else {
      onChange({ ...conditions, items })
    }
  }

  const parseValue = (op: ConditionOp, raw: string): ConditionItem['value'] => {
    if (NO_VALUE_OPS.includes(op)) return null
    if (LIST_OPS.includes(op)) return raw.split(',').map((s) => s.trim()).filter(Boolean)
    if (DAYS_OPS.includes(op)) return parseInt(raw, 10) || 0
    return raw
  }

  return (
    <fieldset className="border border-ui-border dark:border-ui-dark-border rounded-md p-3 space-y-3">
      <legend className="px-1 text-sm font-medium text-text-secondary dark:text-text-dark-secondary">
        {t('scheduledRules.conditions.legend')}
      </legend>
      <p className="text-xs text-text-secondary dark:text-text-dark-secondary">
        {t('scheduledRules.conditions.hint')}
      </p>

      {/* Logic selector */}
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium">{t('scheduledRules.conditions.logic')}:</span>
        {(['AND', 'OR'] as const).map((l) => (
          <label key={l} className="flex items-center gap-1 text-sm cursor-pointer">
            <input
              type="radio"
              name="condition-logic"
              value={l}
              checked={conditions.logic === l}
              onChange={() => updateLogic(l)}
              disabled={disabled}
            />
            {t(l === 'AND' ? 'scheduledRules.conditions.logicAnd' : 'scheduledRules.conditions.logicOr')}
          </label>
        ))}
      </div>

      {/* Condition rows */}
      <div className="space-y-2">
        {conditions.items.map((item, i) => {
          const noValue = NO_VALUE_OPS.includes(item.op)
          const isList = LIST_OPS.includes(item.op)
          const isDays = DAYS_OPS.includes(item.op)
          const rawValue = Array.isArray(item.value)
            ? item.value.join(', ')
            : item.value != null ? String(item.value) : ''

          return (
            <div key={i} className="grid grid-cols-[1fr_1fr_1.5fr_1.5fr_auto] gap-2 items-center">
              <TextInput
                fieldSize="sm"
                value={item.table}
                onChange={(e) => updateItem(i, { table: e.target.value })}
                placeholder={t('scheduledRules.conditions.table')}
                disabled={disabled}
              />
              <TextInput
                fieldSize="sm"
                value={item.field}
                onChange={(e) => updateItem(i, { field: e.target.value })}
                placeholder={t('scheduledRules.conditions.field')}
                disabled={disabled}
              />
              <Select
                fieldSize="sm"
                value={item.op}
                onChange={(e) => {
                  const op = e.target.value as ConditionOp
                  updateItem(i, { op, value: NO_VALUE_OPS.includes(op) ? null : '' })
                }}
                disabled={disabled}
              >
                {ALL_OPS.map((op) => (
                  <option key={op} value={op}>
                    {t(`scheduledRules.conditions.ops.${op}`)}
                  </option>
                ))}
              </Select>
              {noValue ? (
                <div />
              ) : (
                <TextInput
                  fieldSize="sm"
                  type={isDays ? 'number' : 'text'}
                  min={isDays ? 0 : undefined}
                  value={rawValue}
                  onChange={(e) =>
                    updateItem(i, { value: parseValue(item.op, e.target.value) })
                  }
                  placeholder={
                    isList
                      ? t('scheduledRules.conditions.valuePlaceholderIn')
                      : isDays
                        ? t('scheduledRules.conditions.valuePlaceholderDays')
                        : t('scheduledRules.conditions.value')
                  }
                  disabled={disabled}
                />
              )}
              <Button
                variant="outline"
                size="xs"
                type="button"
                onClick={() => removeItem(i)}
                disabled={disabled}
              >
                ×
              </Button>
            </div>
          )
        })}
      </div>

      <Button variant="outline" size="xs" type="button" onClick={addItem} disabled={disabled}>
        {t('scheduledRules.conditions.addCondition')}
      </Button>
    </fieldset>
  )
}
