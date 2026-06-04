import { useMemo } from 'react'
import { Checkbox, Select } from '@ceedcv-maya/shared-ui-react'
import { useLocale } from '@ceedcv-maya/shared-i18n-react'
import { useMyAcademicContext } from '../../profile/api/academicContextApi'
import type { AcademicLevel, AlertAudienceFormState, AudienceKind } from '../types/alertAudience'

interface Props {
  value: AlertAudienceFormState
  onChange: (value: AlertAudienceFormState) => void
  disabled?: boolean
}

export function AlertAudienceFields({ value, onChange, disabled }: Props) {
  const { t } = useLocale()
  const { data: context, isLoading, error } = useMyAcademicContext()

  const teams = context?.teams ?? []
  const studyTypes = context?.study_types ?? []

  /** Cascada como en DMS: opciones solo del padre seleccionado. */
  const studiesForType = useMemo(() => {
    if (!value.audience_study_type_id) return []
    return (context?.studies ?? []).filter(
      (s) => s.study_type_id === value.audience_study_type_id,
    )
  }, [context?.studies, value.audience_study_type_id])

  const modulesForStudy = useMemo(() => {
    if (!value.audience_study_id) return []
    return (context?.modules ?? []).filter((m) => m.study_id === value.audience_study_id)
  }, [context?.modules, value.audience_study_id])

  const needsStudy =
    value.academic_level === 'study' || value.academic_level === 'module'
  const showStudySelect = needsStudy && value.audience_study_type_id !== ''
  const showModuleSelect =
    value.academic_level === 'module' && value.audience_study_id !== ''

  const patch = (partial: Partial<AlertAudienceFormState>) => onChange({ ...value, ...partial })

  const handleNotifyAll = (checked: boolean) => {
    patch({ notify_all: checked })
  }

  const handleAudienceKind = (kind: AudienceKind) => {
    onChange({
      ...value,
      audience_kind: kind,
      audience_study_type_id: '',
      audience_study_id: '',
      audience_module_id: '',
      audience_team_id: '',
    })
  }

  const handleAcademicLevel = (level: AcademicLevel) => {
    const next = { ...value, academic_level: level }
    if (level === 'study_type') {
      next.audience_study_id = ''
      next.audience_module_id = ''
    } else if (level === 'study') {
      next.audience_module_id = ''
    }
    onChange(next)
  }

  const teamsStatus = context?._status?.teams
  const teamsUnavailable = teamsStatus === 'unavailable'
  const noTeamsAssigned =
    value.audience_kind === 'team' &&
    !isLoading &&
    error == null &&
    !teamsUnavailable &&
    teams.length === 0

  const contextUnavailable =
    !value.notify_all &&
    value.audience_kind === 'academic' &&
    (isLoading ||
      error != null ||
      (context != null && studyTypes.length === 0 && teams.length === 0))

  return (
    <fieldset className="space-y-3 rounded-lg border border-ui-border p-3 dark:border-ui-dark-border">
      <legend className="px-1 text-sm font-medium text-text-primary dark:text-text-dark-primary">
        {t('panelAlerts.audience.sectionTitle')}
      </legend>

      <Checkbox
        checked={value.notify_all}
        onChange={handleNotifyAll}
        disabled={disabled}
        label={t('panelAlerts.audience.notifyAll')}
      />

      {!value.notify_all && (
        <>
          {isLoading && (
            <p className="text-sm text-text-muted dark:text-text-dark-muted">
              {t('status.loading')}
            </p>
          )}
          {error && (
            <p role="alert" className="text-sm text-danger">
              {t('panelAlerts.audience.contextError')}
            </p>
          )}

          <div className="flex flex-wrap gap-4">
            <label className="flex items-center gap-2 cursor-pointer text-sm">
              <input
                type="radio"
                name="audience_kind"
                checked={value.audience_kind === 'academic'}
                onChange={() => handleAudienceKind('academic')}
                disabled={disabled || isLoading}
              />
              {t('panelAlerts.audience.kindAcademic')}
            </label>
            <label className="flex items-center gap-2 cursor-pointer text-sm">
              <input
                type="radio"
                name="audience_kind"
                checked={value.audience_kind === 'team'}
                onChange={() => handleAudienceKind('team')}
                disabled={disabled || isLoading}
              />
              {t('panelAlerts.audience.kindTeam')}
            </label>
          </div>

          {value.audience_kind === 'academic' && (
            <div className="space-y-3">
              <div>
                <span className="mb-1 block text-xs font-semibold text-text-secondary dark:text-text-dark-secondary">
                  {t('panelAlerts.audience.academicLevel')}
                </span>
                <div className="flex flex-wrap gap-3">
                  {(['study_type', 'study', 'module'] as const).map((level) => (
                    <label key={level} className="flex items-center gap-2 cursor-pointer text-sm">
                      <input
                        type="radio"
                        name="academic_level"
                        checked={value.academic_level === level}
                        onChange={() => handleAcademicLevel(level)}
                        disabled={disabled || isLoading}
                      />
                      {t(`panelAlerts.audience.level.${level}`)}
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-text-primary dark:text-text-dark-primary">
                  {t('panelAlerts.audience.studyType')} <span className="text-danger">*</span>
                </label>
                <Select
                  fieldSize="sm"
                  value={value.audience_study_type_id}
                  onChange={(e) =>
                    patch({
                      audience_study_type_id: e.target.value,
                      audience_study_id: '',
                      audience_module_id: '',
                    })
                  }
                  disabled={disabled || isLoading || studyTypes.length === 0}
                >
                  <option value="">{t('panelAlerts.audience.selectPlaceholder')}</option>
                  {studyTypes.map((st) => (
                    <option key={st.id} value={st.id}>
                      {st.name} ({st.code})
                    </option>
                  ))}
                </Select>
              </div>

              {needsStudy && !showStudySelect && (
                <p className="text-xs text-text-muted dark:text-text-dark-muted">
                  {t('panelAlerts.audience.selectStudyTypeFirst')}
                </p>
              )}

              {showStudySelect && (
                <div>
                  <label className="mb-1 block text-sm font-medium text-text-primary dark:text-text-dark-primary">
                    {t('panelAlerts.audience.study')} <span className="text-danger">*</span>
                  </label>
                  <Select
                    fieldSize="sm"
                    value={value.audience_study_id}
                    onChange={(e) =>
                      patch({ audience_study_id: e.target.value, audience_module_id: '' })
                    }
                    disabled={disabled || isLoading || studiesForType.length === 0}
                  >
                    <option value="">{t('panelAlerts.audience.selectPlaceholder')}</option>
                    {studiesForType.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.code})
                      </option>
                    ))}
                  </Select>
                </div>
              )}

              {value.academic_level === 'module' && !showModuleSelect && showStudySelect && (
                <p className="text-xs text-text-muted dark:text-text-dark-muted">
                  {t('panelAlerts.audience.selectStudyFirst')}
                </p>
              )}

              {showModuleSelect && (
                <div>
                  <label className="mb-1 block text-sm font-medium text-text-primary dark:text-text-dark-primary">
                    {t('panelAlerts.audience.module')} <span className="text-danger">*</span>
                  </label>
                  <Select
                    fieldSize="sm"
                    value={value.audience_module_id}
                    onChange={(e) => patch({ audience_module_id: e.target.value })}
                    disabled={disabled || isLoading || modulesForStudy.length === 0}
                  >
                    <option value="">{t('panelAlerts.audience.selectPlaceholder')}</option>
                    {modulesForStudy.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name} ({m.code})
                      </option>
                    ))}
                  </Select>
                </div>
              )}
            </div>
          )}

          {value.audience_kind === 'team' && (
            <div className="space-y-2">
              {teamsUnavailable && (
                <p role="alert" className="text-sm text-danger">
                  {t('panelAlerts.audience.teamsUnavailable')}
                </p>
              )}
              {noTeamsAssigned && (
                <p className="text-sm text-text-muted dark:text-text-dark-muted">
                  {t('panelAlerts.audience.noTeamsAssigned')}
                </p>
              )}
              {!teamsUnavailable && teams.length > 0 && (
                <>
                  <label className="mb-1 block text-sm font-medium text-text-primary dark:text-text-dark-primary">
                    {t('panelAlerts.audience.team')} <span className="text-danger">*</span>
                  </label>
                  <Select
                    fieldSize="sm"
                    value={value.audience_team_id}
                    onChange={(e) => patch({ audience_team_id: e.target.value })}
                    disabled={disabled || isLoading}
                  >
                    <option value="">{t('panelAlerts.audience.selectPlaceholder')}</option>
                    {teams.map((team) => (
                      <option key={team.id} value={team.id}>
                        {team.name} ({team.code})
                        {team.is_department ? ` — ${t('panelAlerts.audience.department')}` : ''}
                      </option>
                    ))}
                  </Select>
                </>
              )}
            </div>
          )}

          {contextUnavailable && !isLoading && !error && (
            <p className="text-sm text-text-muted dark:text-text-dark-muted">
              {t('panelAlerts.audience.emptyContext')}
            </p>
          )}
        </>
      )}
    </fieldset>
  )
}
