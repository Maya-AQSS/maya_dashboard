import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm, type UseFormRegister, type FieldErrors } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useAuth, type AuthUser } from '@maya/shared-auth-react'
import {
  Button,
  FieldLabel,
  PageTitle,
  Select,
  TextArea,
  TextInput,
} from '@maya/shared-ui-react'
import { useLocale } from '@maya/shared-i18n-react'
import { updateMyLocale } from '../../../api/auth'
import { useUserProfile } from '../../user-profile'
import { DASHBOARD_PERMISSIONS } from '../../../permissions'
import { updateProfile } from '../api/profileApi'
import {
  createProfileFormSchema,
  emptyProfileForm,
  type ProfileFormInput,
} from '../lib/profileSchema'

interface ProfileUser extends AuthUser {
  id?: string
  surname?: string
  username?: string
  phone?: string
  role?: string
  dni?: string
  street?: string
  addressNumber?: string
  addressFloor?: string
  addressDoor?: string
  postalCode?: string
  city?: string
  bio?: string
}

type ProfileFieldProps = {
  name: keyof ProfileFormInput
  label: string
  type?: 'text' | 'email' | 'tel' | 'url' | 'number' | 'textarea'
  register: UseFormRegister<ProfileFormInput>
  errors: FieldErrors<ProfileFormInput>
  placeholder?: string
  inputMode?: 'numeric'
  pattern?: string
  optionalLabel?: string
  rows?: number
}

function ProfileField({
  name,
  label,
  type = 'text',
  register,
  errors,
  placeholder,
  inputMode,
  pattern,
  optionalLabel,
  rows,
}: ProfileFieldProps) {
  const id = `profile-${name}`
  const displayLabel = optionalLabel ? `${label} ${optionalLabel}` : label
  const error = errors[name]?.message as string | undefined

  return (
    <div className="flex flex-col gap-1">
      <FieldLabel htmlFor={id}>{displayLabel}</FieldLabel>
      {type === 'textarea' ? (
        <TextArea id={id} fieldSize="comfortable" rows={rows ?? 3} {...register(name)} />
      ) : (
        <TextInput
          id={id}
          type={type}
          fieldSize="comfortable"
          placeholder={placeholder}
          inputMode={inputMode}
          pattern={pattern}
          error={!!error}
          {...register(name)}
        />
      )}
      {error && (
        <span className="text-xs text-danger dark:text-danger" role="alert">
          {error}
        </span>
      )}
    </div>
  )
}

function ProfileSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-6 p-5 rounded-lg border border-ui-border dark:border-ui-dark-border bg-ui-body dark:bg-ui-dark-card last:mb-0">
      <h4 className="m-0 mb-4 text-base font-semibold text-text-primary dark:text-text-dark-secondary">
        {title}
      </h4>
      {children}
    </div>
  )
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

  const schema = useMemo(() => createProfileFormSchema(t), [t])

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProfileFormInput>({
    defaultValues: emptyProfileForm,
    mode: 'onChange',
    resolver: zodResolver(schema),
  })

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
      name: user.name ?? '',
      surname: user.surname ?? '',
      username: user.username ?? '',
      email: user.email ?? '',
      phone: user.phone ?? '',
      role: user.role ?? '',
      dni: user.dni ?? '',
      street: user.street ?? '',
      addressNumber: user.addressNumber ?? '',
      addressFloor: user.addressFloor ?? '',
      addressDoor: user.addressDoor ?? '',
      postalCode: user.postalCode ?? '',
      city: user.city ?? '',
      bio: user.bio ?? '',
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
      const updatedUser = await updateProfile({ id: user.id, ...values })

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
          <div className="p-4 sm:p-5 rounded-lg border border-ui-border dark:border-ui-dark-border bg-ui-body dark:bg-ui-dark-card">
            <h4 className="m-0 mb-4 text-base font-semibold text-text-primary dark:text-text-dark-secondary">{t('profile.basicData')}</h4>
            <dl className="m-0 flex flex-col gap-3">
              <div className="grid grid-cols-1 sm:grid-cols-[140px_1fr] gap-1 sm:gap-3 items-baseline">
                <dt className="m-0 text-sm font-medium text-text-secondary dark:text-text-dark-secondary">{t('auth.name')}</dt>
                <dd className="m-0 text-base text-text-primary dark:text-text-dark-primary">{user.name ?? '—'}</dd>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-[140px_1fr] gap-1 sm:gap-3 items-baseline">
                <dt className="m-0 text-sm font-medium text-text-secondary dark:text-text-dark-secondary">{t('auth.surname')}</dt>
                <dd className="m-0 text-base text-text-primary dark:text-text-dark-primary">{user.surname ?? '—'}</dd>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-[140px_1fr] gap-1 sm:gap-3 items-baseline">
                <dt className="m-0 text-sm font-medium text-text-secondary dark:text-text-dark-secondary">{t('profile.dni')}</dt>
                <dd className="m-0 text-base text-text-primary dark:text-text-dark-primary">{user.dni || '—'}</dd>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-[140px_1fr] gap-1 sm:gap-3 items-baseline">
                <dt className="m-0 text-sm font-medium text-text-secondary dark:text-text-dark-secondary">{t('auth.email')}</dt>
                <dd className="m-0 text-base text-text-primary dark:text-text-dark-primary">{user.email ?? '—'}</dd>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-[140px_1fr] gap-1 sm:gap-3 items-baseline">
                <dt className="m-0 text-sm font-medium text-text-secondary dark:text-text-dark-secondary">{t('profile.phone')}</dt>
                <dd className="m-0 text-base text-text-primary dark:text-text-dark-primary">{user.phone || '—'}</dd>
              </div>
            </dl>
          </div>
          <div className="p-4 sm:p-5 rounded-lg border border-ui-border dark:border-ui-dark-border bg-ui-body dark:bg-ui-dark-card">
            <h4 className="m-0 mb-4 text-base font-semibold text-text-primary dark:text-text-dark-secondary">{t('profile.address')}</h4>
            <dl className="m-0 flex flex-col gap-3">
              <div className="grid grid-cols-1 sm:grid-cols-[140px_1fr] gap-1 sm:gap-3 items-baseline">
                <dt className="m-0 text-sm font-medium text-text-secondary dark:text-text-dark-secondary">{t('profile.street')}</dt>
                <dd className="m-0 text-base text-text-primary dark:text-text-dark-primary">{user.street || '—'}</dd>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-[140px_1fr] gap-1 sm:gap-3 items-baseline">
                <dt className="m-0 text-sm font-medium text-text-secondary dark:text-text-dark-secondary">{t('profile.addressNumber')}</dt>
                <dd className="m-0 text-base text-text-primary dark:text-text-dark-primary">{user.addressNumber || '—'}</dd>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-[140px_1fr] gap-1 sm:gap-3 items-baseline">
                <dt className="m-0 text-sm font-medium text-text-secondary dark:text-text-dark-secondary">{t('profile.addressFloor')}</dt>
                <dd className="m-0 text-base text-text-primary dark:text-text-dark-primary">{user.addressFloor || '—'}</dd>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-[140px_1fr] gap-1 sm:gap-3 items-baseline">
                <dt className="m-0 text-sm font-medium text-text-secondary dark:text-text-dark-secondary">{t('profile.addressDoor')}</dt>
                <dd className="m-0 text-base text-text-primary dark:text-text-dark-primary">{user.addressDoor || '—'}</dd>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-[140px_1fr] gap-1 sm:gap-3 items-baseline">
                <dt className="m-0 text-sm font-medium text-text-secondary dark:text-text-dark-secondary">{t('profile.postalCode')}</dt>
                <dd className="m-0 text-base text-text-primary dark:text-text-dark-primary">{user.postalCode || '—'}</dd>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-[140px_1fr] gap-1 sm:gap-3 items-baseline">
                <dt className="m-0 text-sm font-medium text-text-secondary dark:text-text-dark-secondary">{t('profile.city')}</dt>
                <dd className="m-0 text-base text-text-primary dark:text-text-dark-primary">{user.city || '—'}</dd>
              </div>
            </dl>
          </div>
          <div className="p-4 sm:p-5 rounded-lg border border-ui-border dark:border-ui-dark-border bg-ui-body dark:bg-ui-dark-card">
            <h4 className="m-0 mb-4 text-base font-semibold text-text-primary dark:text-text-dark-secondary">{t('profile.account')}</h4>
            <dl className="m-0 flex flex-col gap-3">
              <div className="grid grid-cols-1 sm:grid-cols-[140px_1fr] gap-1 sm:gap-3 items-baseline">
                <dt className="m-0 text-sm font-medium text-text-secondary dark:text-text-dark-secondary">{t('profile.username')}</dt>
                <dd className="m-0 text-base text-text-primary dark:text-text-dark-primary">{user.username ?? '—'}</dd>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-[140px_1fr] gap-1 sm:gap-3 items-baseline">
                <dt className="m-0 text-sm font-medium text-text-secondary dark:text-text-dark-secondary">{t('profile.role')}</dt>
                <dd className="m-0 text-base text-text-primary dark:text-text-dark-primary">{user.role ?? '—'}</dd>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-[140px_1fr] gap-1 sm:gap-3 items-baseline">
                <dt className="m-0 text-sm font-medium text-text-secondary dark:text-text-dark-secondary">{t('profile.bio')}</dt>
                <dd className="m-0 text-base text-text-primary dark:text-text-dark-primary whitespace-pre-wrap leading-normal">{user.bio || '—'}</dd>
              </div>
            </dl>
          </div>

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
            onSubmit={(e) => {
              e.preventDefault()
              void onSubmit()
            }}
          >
            <div className="flex flex-col gap-4 mb-5">
              <ProfileSection title={t('profile.basicData')}>
                <div className="flex flex-col gap-4">
                  <ProfileField name="name" label={t('auth.name')} register={register} errors={errors} />
                  <ProfileField name="surname" label={t('auth.surname')} register={register} errors={errors} />
                  <ProfileField name="dni" label={t('profile.dni')} register={register} errors={errors} placeholder={t('profile.placeholderDni')} />
                  <ProfileField name="email" label={t('auth.email')} type="email" register={register} errors={errors} />
                  <ProfileField name="phone" label={t('profile.phone')} type="tel" register={register} errors={errors} />
                </div>
              </ProfileSection>

              <ProfileSection title={t('profile.address')}>
                <div className="flex flex-col gap-4">
                  <ProfileField name="street" label={t('profile.street')} register={register} errors={errors} />
                  <ProfileField name="addressNumber" label={t('profile.addressNumber')} register={register} errors={errors} inputMode="numeric" pattern="[0-9]*" />
                  <ProfileField name="addressFloor" label={t('profile.addressFloor')} register={register} errors={errors} optionalLabel={t('profile.optional')} inputMode="numeric" pattern="[0-9]*" />
                  <ProfileField name="addressDoor" label={t('profile.addressDoor')} register={register} errors={errors} optionalLabel={t('profile.optional')} inputMode="numeric" pattern="[0-9]*" />
                  <ProfileField name="postalCode" label={t('profile.postalCode')} register={register} errors={errors} placeholder={t('profile.placeholderPostalCode')} />
                  <ProfileField name="city" label={t('profile.city')} register={register} errors={errors} />
                </div>
              </ProfileSection>

              <ProfileSection title={t('profile.account')}>
                <div className="flex flex-col gap-4">
                  <ProfileField name="username" label={t('profile.username')} register={register} errors={errors} />
                  <ProfileField name="role" label={t('profile.role')} register={register} errors={errors} />
                  <ProfileField name="bio" label={t('profile.bio')} type="textarea" register={register} errors={errors} rows={3} />
                </div>
              </ProfileSection>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <Button type="button" variant="secondary" size="sm" onClick={handleCancel} disabled={saving} className="w-full sm:w-auto">
                {t('profile.cancel')}
              </Button>
              <Button type="submit" variant="primary" size="sm" disabled={saving} loading={saving} className="w-full sm:w-auto">
                {saving ? t('profile.saving') : t('profile.save')}
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
  const { t, locale, setLocale, localeOptions } = useLocale()
  const [savingLocale, setSavingLocale] = useState(false)

  // Cambio de idioma: primero llama al endpoint (MOCK hoy) para que cuando
  // exista la escritura real a Odoo la UI esté ya lista. Tras 200 OK aplica
  // el cambio local (i18next + localStorage + maya_user_profile.locale).
  const handleLocaleChange = async (next: string) => {
    if (!canUpdate || next === locale || savingLocale) return
    setSavingLocale(true)
    try {
      await updateMyLocale(next)
      setLocale(next)
    } catch (error) {
      console.error('[profile] updateMyLocale failed', error)
    } finally {
      setSavingLocale(false)
    }
  }

  return (
    <div className="p-4 sm:p-5 rounded-lg border border-ui-border dark:border-ui-dark-border bg-ui-body dark:bg-ui-dark-card">
      <h4 className="m-0 mb-4 text-base font-semibold text-text-primary dark:text-text-dark-secondary">
        {t('profile.preferences') || 'Preferencias'}
      </h4>
      <div className="grid grid-cols-1 sm:grid-cols-[140px_1fr] gap-2 sm:gap-3 items-center">
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
          {localeOptions.map((opt: { code: string; label: string }) => (
            <option key={opt.code} value={opt.code}>
              {opt.label}
            </option>
          ))}
        </Select>
      </div>
    </div>
  )
}

export default ProfilePage
