import { useState, type ChangeEvent } from 'react'
import { useNavigate } from 'react-router-dom'
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
import { updateProfile } from '../api/profileApi'
import { validateProfileForm } from '../lib/profileValidation'

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

type ProfileFormData = {
  name: string
  surname: string
  username: string
  email: string
  phone: string
  role: string
  dni: string
  street: string
  addressNumber: string
  addressFloor: string
  addressDoor: string
  postalCode: string
  city: string
  bio: string
}

type ProfileFieldProps = {
  name: keyof ProfileFormData
  label: string
  type?: 'text' | 'email' | 'tel' | 'url' | 'number' | 'textarea'
  value: string
  onChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void
  error?: string
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
  value,
  onChange,
  error,
  placeholder,
  inputMode,
  pattern,
  optionalLabel,
  rows,
}: ProfileFieldProps) {
  const id = `profile-${name}`
  const displayLabel = optionalLabel ? `${label} ${optionalLabel}` : label
  return (
    <div className="flex flex-col gap-1">
      <FieldLabel htmlFor={id}>{displayLabel}</FieldLabel>
      {type === 'textarea' ? (
        <TextArea
          id={id}
          name={name}
          fieldSize="comfortable"
          value={value}
          onChange={onChange as (e: ChangeEvent<HTMLTextAreaElement>) => void}
          rows={rows ?? 3}
          error={!!error}
        />
      ) : (
        <TextInput
          id={id}
          name={name}
          type={type}
          fieldSize="comfortable"
          value={value}
          onChange={onChange as (e: ChangeEvent<HTMLInputElement>) => void}
          placeholder={placeholder}
          inputMode={inputMode}
          pattern={pattern}
          error={!!error}
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

const emptyForm: ProfileFormData = {
  name: '',
  surname: '',
  username: '',
  email: '',
  phone: '',
  role: '',
  dni: '',
  street: '',
  addressNumber: '',
  addressFloor: '',
  addressDoor: '',
  postalCode: '',
  city: '',
  bio: '',
}

function ProfilePage() {
  const { user: authUser } = useAuth()
  const user = authUser as ProfileUser | null
  const { t } = useLocale()
  const navigate = useNavigate()
  const [isEditing, setIsEditing] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [saveError, setSaveError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState<ProfileFormData>(emptyForm)

  if (!user) {
    return <p className="text-text-primary dark:text-text-dark-primary">{t('profile.noUser')}</p>
  }

  const handleEdit = () => {
    setFormData({
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
    setErrors({})
    setSaveError(null)
    setIsEditing(true)
  }

  const handleCancel = () => {
    setErrors({})
    setSaveError(null)
    setIsEditing(false)
  }

  const handleChange = (field: keyof ProfileFormData) =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setFormData((prev) => ({ ...prev, [field]: event.target.value }))
    }

  const handleSave = async () => {
    const { valid, errors: validationErrors } = validateProfileForm(formData, t)

    if (!valid) {
      setErrors(validationErrors)
      setSaveError(null)
      return
    }

    setErrors({})
    setSaveError(null)
    setSaving(true)

    try {
      const payload = {
        id: user.id,
        name: formData.name.trim(),
        surname: formData.surname.trim(),
        username: formData.username.trim(),
        email: formData.email.trim(),
        phone: (formData.phone ?? '').trim(),
        role: formData.role.trim(),
        dni: (formData.dni ?? '').trim(),
        street: (formData.street ?? '').trim(),
        addressNumber: (formData.addressNumber ?? '').trim(),
        addressFloor: (formData.addressFloor ?? '').trim(),
        addressDoor: (formData.addressDoor ?? '').trim(),
        postalCode: (formData.postalCode ?? '').trim(),
        city: (formData.city ?? '').trim(),
        bio: (formData.bio ?? '').trim(),
      }

      const updatedUser = await updateProfile(payload)

      if (!updatedUser) {
        setSaveError(t('profile.saveError'))
        return
      }

      setIsEditing(false)
    } catch (error) {
      const msg = (error as { message?: string })?.message ?? ''
      setSaveError(msg.startsWith('profile.') ? t(msg) : msg || t('profile.saveError'))
    } finally {
      setSaving(false)
    }
  }

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
          !isEditing ? (
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

          <PreferencesCard />
        </section>
      ) : (
        <section className="max-w-[600px] mx-auto min-w-0">
          {saveError && (
            <p className="mb-4 py-2 px-3 text-sm text-danger dark:text-danger bg-danger-light dark:bg-danger-dark/30 rounded-lg" role="alert">
              {saveError}
            </p>
          )}
          <div className="flex flex-col gap-4 mb-5">
            <ProfileSection title={t('profile.basicData')}>
              <div className="flex flex-col gap-4">
                <ProfileField name="name" label={t('auth.name')} value={formData.name} onChange={handleChange('name')} error={errors.name} />
                <ProfileField name="surname" label={t('auth.surname')} value={formData.surname} onChange={handleChange('surname')} error={errors.surname} />
                <ProfileField name="dni" label={t('profile.dni')} value={formData.dni} onChange={handleChange('dni')} error={errors.dni} placeholder={t('profile.placeholderDni')} />
                <ProfileField name="email" label={t('auth.email')} type="email" value={formData.email} onChange={handleChange('email')} error={errors.email} />
                <ProfileField name="phone" label={t('profile.phone')} type="tel" value={formData.phone} onChange={handleChange('phone')} error={errors.phone} />
              </div>
            </ProfileSection>

            <ProfileSection title={t('profile.address')}>
              <div className="flex flex-col gap-4">
                <ProfileField name="street" label={t('profile.street')} value={formData.street} onChange={handleChange('street')} error={errors.street} />
                <ProfileField name="addressNumber" label={t('profile.addressNumber')} value={formData.addressNumber} onChange={handleChange('addressNumber')} error={errors.addressNumber} inputMode="numeric" pattern="[0-9]*" />
                <ProfileField name="addressFloor" label={t('profile.addressFloor')} value={formData.addressFloor} onChange={handleChange('addressFloor')} error={errors.addressFloor} optionalLabel={t('profile.optional')} inputMode="numeric" pattern="[0-9]*" />
                <ProfileField name="addressDoor" label={t('profile.addressDoor')} value={formData.addressDoor} onChange={handleChange('addressDoor')} error={errors.addressDoor} optionalLabel={t('profile.optional')} inputMode="numeric" pattern="[0-9]*" />
                <ProfileField name="postalCode" label={t('profile.postalCode')} value={formData.postalCode} onChange={handleChange('postalCode')} error={errors.postalCode} placeholder={t('profile.placeholderPostalCode')} />
                <ProfileField name="city" label={t('profile.city')} value={formData.city} onChange={handleChange('city')} error={errors.city} />
              </div>
            </ProfileSection>

            <ProfileSection title={t('profile.account')}>
              <div className="flex flex-col gap-4">
                <ProfileField name="username" label={t('profile.username')} value={formData.username} onChange={handleChange('username')} error={errors.username} />
                <ProfileField name="role" label={t('profile.role')} value={formData.role} onChange={handleChange('role')} error={errors.role} />
                <ProfileField name="bio" label={t('profile.bio')} type="textarea" value={formData.bio} onChange={handleChange('bio')} error={errors.bio} rows={3} />
              </div>
            </ProfileSection>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <Button variant="secondary" size="sm" onClick={handleCancel} disabled={saving} className="w-full sm:w-auto">
              {t('profile.cancel')}
            </Button>
            <Button variant="primary" size="sm" onClick={handleSave} disabled={saving} loading={saving} className="w-full sm:w-auto">
              {saving ? t('profile.saving') : t('profile.save')}
            </Button>
          </div>
        </section>
      )}
    </>
  )
}

/**
 * Tarjeta de preferencias en el perfil.
 * Sustituye al `LocaleSelector` global del antiguo topbar.
 */
function PreferencesCard() {
  const { t, locale, setLocale, localeOptions } = useLocale()
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
          onChange={(e) => setLocale(e.target.value)}
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
