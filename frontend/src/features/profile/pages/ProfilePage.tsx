import { useMemo, useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm, type UseFormRegister, type FieldErrors } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useAuth, type AuthUser } from '@ceedcv-maya/shared-auth-react'
import {
  Button,
  FieldLabel,
  PageTitle,
  Select,
  TextInput,
} from '@ceedcv-maya/shared-ui-react'
import { useLocale } from '@ceedcv-maya/shared-i18n-react'
import { UserAcademicContext } from '@ceedcv-maya/shared-profile-react'
import { updateMyLocale } from '../../../api/auth'
import { useUserProfile } from '../../user-profile'
import { DASHBOARD_PERMISSIONS } from '../../../permissions'
import { useLanguages } from '../../languages/useLanguages'
import { useMyAcademicContext } from '../api/academicContextApi'
import { useMyEmployeeData } from '../api/employeeApi'
import { updateProfile } from '../api/profileApi'
import {
  createEmployeeFormSchema,
  emptyEmployeeForm,
  type EmployeeFormInput,
} from '../lib/profileSchema'

interface ProfileUser extends AuthUser {
  id?: string
  surname?: string
  username?: string
  phone?: string
  role?: string
  dni?: string
}

type EmployeeFieldProps = {
  name: keyof EmployeeFormInput
  label: string
  type?: 'text' | 'email' | 'tel'
  register: UseFormRegister<EmployeeFormInput>
  errors: FieldErrors<EmployeeFormInput>
  placeholder?: string
  optionalLabel?: string
}

function EmployeeField({
  name,
  label,
  type = 'text',
  register,
  errors,
  placeholder,
  optionalLabel,
}: EmployeeFieldProps) {
  const id = `employee-${name}`
  const displayLabel = optionalLabel ? `${label} ${optionalLabel}` : label
  const error = errors[name]?.message as string | undefined

  return (
    <div className="flex flex-col gap-1">
      <FieldLabel htmlFor={id}>{displayLabel}</FieldLabel>
      <TextInput
        id={id}
        type={type}
        fieldSize="comfortable"
        placeholder={placeholder}
        error={!!error}
        {...register(name)}
      />
      {error && (
        <span className="text-xs text-danger dark:text-danger" role="alert">
          {error}
        </span>
      )}
    </div>
  )
}

function ProfileSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="p-4 sm:p-5 rounded-lg border border-ui-border dark:border-ui-dark-border bg-ui-body dark:bg-ui-dark-card">
      <h4 className="m-0 mb-4 text-base font-semibold text-text-primary dark:text-text-dark-secondary">
        {title}
      </h4>
      {children}
    </div>
  )
}

function ProfileDl({ children }: { children: ReactNode }) {
  return <dl className="m-0 flex flex-col gap-3">{children}</dl>
}

function ProfileRow({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-[160px_1fr] gap-1 sm:gap-3 items-baseline">
      <dt className="m-0 text-sm font-medium text-text-secondary dark:text-text-dark-secondary">{label}</dt>
      <dd className="m-0 text-base text-text-primary dark:text-text-dark-primary">{value || '—'}</dd>
    </div>
  )
}

function TeamBadgeList({ items }: { items: Array<{ name: string; code?: string }> }) {
  if (!items.length) return <span className="text-sm text-text-secondary dark:text-text-dark-secondary">—</span>
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item, index) => (
        <span
          key={item.code || item.name || `team-${index}`}
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-ui-border dark:bg-ui-dark-border text-text-primary dark:text-text-dark-primary"
        >
          {item.code && <span className="opacity-60">{item.code}</span>}
          {item.name}
        </span>
      ))}
    </div>
  )
}

const POSITION_TYPE_LABELS: Record<string, string> = {
  AJC: 'Adjudicaciones julio carrera',
  AJT: 'Adjudicaciones julio interino',
  AS: 'Adjudicaciones septiembre',
  PRM: 'Definitiva',
  CMS: 'Comisión servicios',
  CES: 'Específica',
  ESPJ: 'Puesto específico',
  SUP: 'Suprimida',
}

const KEYS_LABELS: Record<string, string> = {
  HO: 'Entregadas',
  RT: 'Devueltas',
  PN: 'Pendiente de devolución',
}

function ProfilePage() {
  const { user: authUser } = useAuth()
  const user = authUser as ProfileUser | null
  const { hasPermission } = useUserProfile()
  const canShow = hasPermission(DASHBOARD_PERMISSIONS.profileShow)
  const canUpdate = hasPermission(DASHBOARD_PERMISSIONS.profileUpdate)
  const { t } = useLocale()
  const navigate = useNavigate()
  const [isEditing, setIsEditing] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  const schema = useMemo(() => createEmployeeFormSchema(t), [t])
  const academicContextTexts = useMemo(() => ({
    loading: t('profile.academicContext.loading'),
    loadErrorPrefix: t('profile.academicContext.loadErrorPrefix'),
    sectionAriaLabel: t('profile.academicContext.sectionAriaLabel'),
    blockLabels: {
      study_types: t('profile.academicContext.blocks.studyTypes'),
      studies: t('profile.academicContext.blocks.studies'),
      modules: t('profile.academicContext.blocks.modules'),
      teams: t('profile.academicContext.blocks.teams'),
    },
    unavailableBadge: t('profile.academicContext.unavailableBadge'),
    blockUnavailable: t('profile.academicContext.blockUnavailable'),
    emptyState: t('profile.academicContext.emptyState'),
    headers: {
      code: t('profile.academicContext.headers.code'),
      name: t('profile.academicContext.headers.name'),
      id: t('profile.academicContext.headers.id'),
      type: t('profile.academicContext.headers.type'),
      department: t('profile.academicContext.headers.department'),
    },
  }), [t])

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<EmployeeFormInput>({
    defaultValues: emptyEmployeeForm,
    mode: 'onChange',
    resolver: zodResolver(schema),
  })

  const { data: academicContext, isLoading: loadingAcademic, error: academicError } =
    useMyAcademicContext()

  const { data: employeeData } = useMyEmployeeData()

  const departments = useMemo(
    () => (academicContext?.teams ?? []).filter((t) => t.is_department),
    [academicContext],
  )
  const workTeams = useMemo(
    () => (academicContext?.teams ?? []).filter((t) => !t.is_department),
    [academicContext],
  )

  if (!user) {
    return <p className="text-text-primary dark:text-text-dark-primary">{t('profile.noUser')}</p>
  }

  if (!canShow) {
    return (
      <>
        <PageTitle title={t('profile.title')} onBack={() => navigate(-1)} />
        <p className="text-text-primary dark:text-text-dark-primary" role="status">
          {t('profile.noPermission')}
        </p>
      </>
    )
  }

  const handleEdit = () => {
    if (!canUpdate) return
    reset({
      personal_email: employeeData?.personal_email ?? '',
      iban: employeeData?.iban ?? '',
      car_registration_number_1: employeeData?.car_registration_number_1 ?? '',
      car_registration_number_2: employeeData?.car_registration_number_2 ?? '',
      car_registration_number_3: employeeData?.car_registration_number_3 ?? '',
    })
    setSaveError(null)
    setIsEditing(true)
  }

  const handleCancel = () => {
    setSaveError(null)
    setIsEditing(false)
  }

  const onSubmit = handleSubmit(async (values) => {
    if (!canUpdate) return
    setSaveError(null)
    try {
      const updatedUser = await updateProfile(values)

      if (!updatedUser) {
        setSaveError(t('profile.saveError'))
        return
      }

      setIsEditing(false)
    } catch (error) {
      const msg = (error as { message?: string })?.message ?? ''
      setSaveError(msg.startsWith('profile.') ? t(msg) : msg || t('profile.saveError'))
    }
  })

  const saving = isSubmitting

  return (
    <>
      <PageTitle
        title={isEditing ? t('profile.editTitle') : t('profile.title')}
        subtitle={
          isEditing
            ? t('profile.editSubtitle')
            : t('profile.hello', {
                name: [user.name, user.surname].filter(Boolean).join(' ') || user.name,
              })
        }
        onBack={() => navigate(-1)}
        actions={
          !isEditing && canUpdate ? (
            <Button variant="primary" size="sm" onClick={handleEdit} className="w-full sm:w-auto">
              {t('profile.edit')}
            </Button>
          ) : null
        }
      />

      {!isEditing ? (
        <section className="max-w-[600px] mx-auto flex flex-col gap-4 sm:gap-6">
          {/* Datos básicos */}
          <ProfileSection title={t('profile.basicData')}>
            <ProfileDl>
              <ProfileRow label={t('auth.name')} value={user.name} />
              <ProfileRow label={t('auth.surname')} value={user.surname} />
              <ProfileRow label={t('profile.dni')} value={user.dni} />
              <ProfileRow label={t('auth.email')} value={user.email} />
              <ProfileRow label={t('profile.phone')} value={user.phone} />
            </ProfileDl>
          </ProfileSection>

          {/* Datos laborales */}
          <ProfileSection title={t('profile.employeeData')}>
            <ProfileDl>
              <ProfileRow
                label={t('profile.positionType')}
                value={employeeData?.position_type ? (POSITION_TYPE_LABELS[employeeData.position_type] ?? employeeData.position_type) : null}
              />
              <ProfileRow label={t('profile.supervisor')} value={employeeData?.supervisor_name} />
              <ProfileRow label={t('profile.mentor')} value={employeeData?.mentor_name} />
              <ProfileRow label={t('profile.personalEmail')} value={employeeData?.personal_email} />
            </ProfileDl>
          </ProfileSection>

          {/* Departamentos */}
          <ProfileSection title={t('profile.departments')}>
            <TeamBadgeList items={departments.map((d) => ({ name: d.name, code: d.code }))} />
          </ProfileSection>

          {/* Equipos */}
          <ProfileSection title={t('profile.workTeams')}>
            <TeamBadgeList items={workTeams.map((d) => ({ name: d.name, code: d.code }))} />
          </ProfileSection>

          {/* Administración interna */}
          <ProfileSection title={t('profile.adminData')}>
            <ProfileDl>
              <ProfileRow label={t('profile.idCardRfid')} value={employeeData?.id_card_rfid} />
              <ProfileRow
                label={t('profile.keys')}
                value={employeeData?.keys ? (KEYS_LABELS[employeeData.keys] ?? employeeData.keys) : null}
              />
              <ProfileRow label={t('profile.dateKeysHandover')} value={employeeData?.date_keys_handover} />
              <ProfileRow label={t('profile.dateKeysReturn')} value={employeeData?.date_keys_return} />
              <ProfileRow label={t('profile.iban')} value={employeeData?.iban} />
            </ProfileDl>
          </ProfileSection>

          {/* Vehículos */}
          <ProfileSection title={t('profile.vehicles')}>
            <ProfileDl>
              <ProfileRow label={t('profile.carRegistration1')} value={employeeData?.car_registration_number_1} />
              <ProfileRow label={t('profile.carRegistration2')} value={employeeData?.car_registration_number_2} />
              <ProfileRow label={t('profile.carRegistration3')} value={employeeData?.car_registration_number_3} />
            </ProfileDl>
          </ProfileSection>

          <UserAcademicContext
            data={academicContext}
            isLoading={loadingAcademic}
            error={academicError instanceof Error ? academicError : null}
            texts={academicContextTexts}
          />

          <PreferencesCard canUpdate={canUpdate} />
        </section>
      ) : (
        <section className="max-w-[600px] mx-auto min-w-0">
          {saveError && (
            <p className="mb-4 py-2 px-3 text-sm text-danger dark:text-danger bg-danger-light dark:bg-danger-dark/30 rounded-lg" role="alert">
              {saveError}
            </p>
          )}
          <form
            onSubmit={(e) => void onSubmit(e)}
          >
            <div className="flex flex-col gap-4 mb-5">
              {/* Email personal */}
              <ProfileSection title={t('profile.personalEmail')}>
                <div className="flex flex-col gap-4">
                  <EmployeeField
                    name="personal_email"
                    label={t('profile.personalEmail')}
                    type="email"
                    register={register}
                    errors={errors}
                    optionalLabel={t('values.optional')}
                  />
                </div>
              </ProfileSection>

              {/* IBAN */}
              <ProfileSection title={t('profile.iban')}>
                <div className="flex flex-col gap-4">
                  <EmployeeField
                    name="iban"
                    label={t('profile.iban')}
                    register={register}
                    errors={errors}
                    placeholder="ES76 2077 0024 0031 0257 5701"
                    optionalLabel={t('values.optional')}
                  />
                </div>
              </ProfileSection>

              {/* Vehículos */}
              <ProfileSection title={t('profile.vehicles')}>
                <div className="flex flex-col gap-4">
                  <EmployeeField
                    name="car_registration_number_1"
                    label={t('profile.carRegistration1')}
                    register={register}
                    errors={errors}
                    placeholder="1234ABC"
                    optionalLabel={t('values.optional')}
                  />
                  <EmployeeField
                    name="car_registration_number_2"
                    label={t('profile.carRegistration2')}
                    register={register}
                    errors={errors}
                    placeholder="1234ABC"
                    optionalLabel={t('values.optional')}
                  />
                  <EmployeeField
                    name="car_registration_number_3"
                    label={t('profile.carRegistration3')}
                    register={register}
                    errors={errors}
                    placeholder="1234ABC"
                    optionalLabel={t('values.optional')}
                  />
                </div>
              </ProfileSection>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <Button type="button" variant="secondary" size="sm" onClick={handleCancel} disabled={saving} className="w-full sm:w-auto">
                {t('actions.cancel')}
              </Button>
              <Button type="submit" variant="primary" size="sm" disabled={saving} loading={saving} className="w-full sm:w-auto">
                {saving ? t('actions.saving') : t('profile.save')}
              </Button>
            </div>
          </form>
        </section>
      )}
    </>
  )
}

/**
 * Tarjeta de preferencias en el perfil. Único punto de cambio de idioma
 * en el ecosistema (no hay selector en el sidebar).
 */
function PreferencesCard({ canUpdate }: { canUpdate: boolean }) {
  const { t, locale, setLocale } = useLocale()
  // Idiomas disponibles desde el catálogo (Odoo res.lang) en vez de la lista
  // hardcodeada; degrada a es/va/en si el endpoint no está disponible.
  const { languages } = useLanguages()
  const [savingLocale, setSavingLocale] = useState(false)

  // Cambio de idioma: aplica PRIMERO el cambio local (i18next + cookie
  // cross-app + cache) — la cookie `maya_session_overrides.locale` es la
  // fuente de verdad provisional hasta que exista persistencia real en Odoo.
  // Tras eso, llama al endpoint en best-effort (hoy es no-op vía
  // NoopLocaleWriter, mañana persistirá en Odoo sin tocar este código).
  const handleLocaleChange = async (next: string) => {
    if (!canUpdate || next === locale || savingLocale) return
    setSavingLocale(true)
    setLocale(next)
    try {
      await updateMyLocale(next)
    } catch (error) {
      // removed debug log
    } finally {
      setSavingLocale(false)
    }
  }

  return (
    <div className="p-4 sm:p-5 rounded-lg border border-ui-border dark:border-ui-dark-border bg-ui-body dark:bg-ui-dark-card">
      <h4 className="m-0 mb-4 text-base font-semibold text-text-primary dark:text-text-dark-secondary">
        {t('userMenu.preferences') || 'Preferencias'}
      </h4>
      <div className="grid grid-cols-1 sm:grid-cols-[160px_1fr] gap-2 sm:gap-3 items-center">
        <FieldLabel htmlFor="profile-locale-select">
          {t('profile.language') || 'Idioma'}
        </FieldLabel>
        <Select
          id="profile-locale-select"
          fieldSize="md"
          value={locale}
          disabled={savingLocale || !canUpdate}
          onChange={(e) => void handleLocaleChange(e.target.value)}
          className="max-w-[260px]"
        >
          {languages.map((opt) => (
            <option key={opt.code} value={opt.code}>
              {opt.name}
            </option>
          ))}
        </Select>
      </div>
    </div>
  )
}

export default ProfilePage
