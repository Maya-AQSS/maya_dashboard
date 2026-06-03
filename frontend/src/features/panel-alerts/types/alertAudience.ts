export type AudienceKind = 'academic' | 'team'
export type AcademicLevel = 'study_type' | 'study' | 'module'

/** Campos de audiencia tal como los devuelve la API. */
export interface AlertAudienceFields {
  notify_all: boolean
  audience_kind: AudienceKind | null
  academic_level: AcademicLevel | null
  audience_study_type_id: string | null
  audience_study_id: string | null
  audience_module_id: string | null
  audience_team_id: string | null
}

/** Estado del formulario de audiencia. */
export interface AlertAudienceFormState {
  notify_all: boolean
  audience_kind: AudienceKind
  academic_level: AcademicLevel
  audience_study_type_id: string
  audience_study_id: string
  audience_module_id: string
  audience_team_id: string
}

export type AlertAudiencePayload = {
  notify_all: boolean
  audience_kind?: AudienceKind
  academic_level?: AcademicLevel
  audience_study_type_id?: string
  audience_study_id?: string
  audience_module_id?: string
  audience_team_id?: string
}

export function defaultAudienceFormState(): AlertAudienceFormState {
  return {
    notify_all: true,
    audience_kind: 'academic',
    academic_level: 'study_type',
    audience_study_type_id: '',
    audience_study_id: '',
    audience_module_id: '',
    audience_team_id: '',
  }
}

export function audienceFormStateFromApi(
  source?: Partial<AlertAudienceFields> | null,
): AlertAudienceFormState {
  if (!source || source.notify_all !== false) {
    return defaultAudienceFormState()
  }

  return {
    notify_all: false,
    audience_kind: source.audience_kind === 'team' ? 'team' : 'academic',
    academic_level:
      source.academic_level === 'study' || source.academic_level === 'module'
        ? source.academic_level
        : 'study_type',
    audience_study_type_id: source.audience_study_type_id ?? '',
    audience_study_id: source.audience_study_id ?? '',
    audience_module_id: source.audience_module_id ?? '',
    audience_team_id: source.audience_team_id ?? '',
  }
}

export function buildAudiencePayload(state: AlertAudienceFormState): AlertAudiencePayload {
  if (state.notify_all) {
    return { notify_all: true }
  }

  if (state.audience_kind === 'team') {
    return {
      notify_all: false,
      audience_kind: 'team',
      audience_team_id: state.audience_team_id,
    }
  }

  const payload: AlertAudiencePayload = {
    notify_all: false,
    audience_kind: 'academic',
    academic_level: state.academic_level,
    audience_study_type_id: state.audience_study_type_id,
  }

  if (state.academic_level === 'study' || state.academic_level === 'module') {
    payload.audience_study_id = state.audience_study_id
  }

  if (state.academic_level === 'module') {
    payload.audience_module_id = state.audience_module_id
  }

  return payload
}

export function validateAudienceForm(
  state: AlertAudienceFormState,
  messages: {
    teamRequired: string
    studyTypeRequired: string
    studyRequired: string
    moduleRequired: string
  },
): string | null {
  if (state.notify_all) {
    return null
  }

  if (state.audience_kind === 'team') {
    return state.audience_team_id ? null : messages.teamRequired
  }

  if (!state.audience_study_type_id) {
    return messages.studyTypeRequired
  }

  if (
    (state.academic_level === 'study' || state.academic_level === 'module') &&
    !state.audience_study_id
  ) {
    return messages.studyRequired
  }

  if (state.academic_level === 'module' && !state.audience_module_id) {
    return messages.moduleRequired
  }

  return null
}
