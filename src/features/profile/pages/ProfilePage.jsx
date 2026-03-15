import { useState } from 'react'
import { useAuth } from '../../../app/auth/AuthContext'
import PageHeader from '../../../shared/components/PageHeader'
import FormField from '../../../shared/components/FormField'
import FormSection from '../../../shared/components/FormSection'
import FormActions from '../../../shared/components/FormActions'
import { useLocale } from '../../../shared/i18n'
import { updateProfile } from '../api/profileApi'
import { validateProfileForm } from '../lib/profileValidation'

function ProfilePage() {
  const { user, setUser } = useAuth()
  const { t } = useLocale()
  const [isEditing, setIsEditing] = useState(false)
  const [errors, setErrors] = useState({})
  const [saveError, setSaveError] = useState(null)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
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
  })

  if (!user) {
    return <p className="text-gray-900 dark:text-odoo-dark-text">{t('profile.noUser')}</p>
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

  const handleChange = (field) => (event) => {
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
      setUser(updatedUser)
    } catch (error) {
      setSaveError(error?.message ?? t('profile.saveError'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <PageHeader
        title={isEditing ? t('profile.editTitle') : t('profile.title')}
        subtitle={isEditing ? t('profile.editSubtitle') : t('profile.hello', { name: [user.name, user.surname].filter(Boolean).join(' ') || user.name })}
        rightAction={
          !isEditing ? (
            <button
              type="button"
              className="w-full sm:w-auto py-2 sm:py-1.5 px-3.5 rounded-full text-sm font-medium border-none cursor-pointer bg-odoo-primary text-gray-50 hover:bg-odoo-primary-hover"
              onClick={handleEdit}
            >
              {t('profile.edit')}
            </button>
          ) : null
        }
      />

      {!isEditing ? (
        <section className="max-w-[600px] mx-auto flex flex-col gap-4 sm:gap-6">
          <div className="p-4 sm:p-5 rounded-lg border border-gray-200 dark:border-odoo-dark-border bg-gray-50 dark:bg-odoo-dark-surface">
            <h4 className="m-0 mb-4 text-[0.95rem] font-semibold text-gray-700 dark:text-odoo-dark-muted">{t('profile.basicData')}</h4>
            <dl className="m-0 flex flex-col gap-3">
              <div className="grid grid-cols-1 sm:grid-cols-[140px_1fr] gap-1 sm:gap-3 items-baseline">
                <dt className="m-0 text-sm font-medium text-gray-500 dark:text-odoo-dark-muted">{t('auth.name')}</dt>
                <dd className="m-0 text-[0.95rem] text-gray-900 dark:text-odoo-dark-text">{user.name ?? '—'}</dd>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-[140px_1fr] gap-1 sm:gap-3 items-baseline">
                <dt className="m-0 text-sm font-medium text-gray-500 dark:text-odoo-dark-muted">{t('auth.surname')}</dt>
                <dd className="m-0 text-[0.95rem] text-gray-900 dark:text-odoo-dark-text">{user.surname ?? '—'}</dd>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-[140px_1fr] gap-1 sm:gap-3 items-baseline">
                <dt className="m-0 text-sm font-medium text-gray-500 dark:text-odoo-dark-muted">{t('profile.dni')}</dt>
                <dd className="m-0 text-[0.95rem] text-gray-900 dark:text-odoo-dark-text">{user.dni || '—'}</dd>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-[140px_1fr] gap-1 sm:gap-3 items-baseline">
                <dt className="m-0 text-sm font-medium text-gray-500 dark:text-odoo-dark-muted">{t('auth.email')}</dt>
                <dd className="m-0 text-[0.95rem] text-gray-900 dark:text-odoo-dark-text">{user.email ?? '—'}</dd>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-[140px_1fr] gap-1 sm:gap-3 items-baseline">
                <dt className="m-0 text-sm font-medium text-gray-500 dark:text-odoo-dark-muted">{t('profile.phone')}</dt>
                <dd className="m-0 text-[0.95rem] text-gray-900 dark:text-odoo-dark-text">{user.phone || '—'}</dd>
              </div>
            </dl>
          </div>
          <div className="p-4 sm:p-5 rounded-lg border border-gray-200 dark:border-odoo-dark-border bg-gray-50 dark:bg-odoo-dark-surface">
            <h4 className="m-0 mb-4 text-[0.95rem] font-semibold text-gray-700 dark:text-odoo-dark-muted">{t('profile.address')}</h4>
            <dl className="m-0 flex flex-col gap-3">
              <div className="grid grid-cols-1 sm:grid-cols-[140px_1fr] gap-1 sm:gap-3 items-baseline">
                <dt className="m-0 text-sm font-medium text-gray-500 dark:text-odoo-dark-muted">{t('profile.street')}</dt>
                <dd className="m-0 text-[0.95rem] text-gray-900 dark:text-odoo-dark-text">{user.street || '—'}</dd>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-[140px_1fr] gap-1 sm:gap-3 items-baseline">
                <dt className="m-0 text-sm font-medium text-gray-500 dark:text-odoo-dark-muted">{t('profile.addressNumber')}</dt>
                <dd className="m-0 text-[0.95rem] text-gray-900 dark:text-odoo-dark-text">{user.addressNumber || '—'}</dd>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-[140px_1fr] gap-1 sm:gap-3 items-baseline">
                <dt className="m-0 text-sm font-medium text-gray-500 dark:text-odoo-dark-muted">{t('profile.addressFloor')}</dt>
                <dd className="m-0 text-[0.95rem] text-gray-900 dark:text-odoo-dark-text">{user.addressFloor || '—'}</dd>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-[140px_1fr] gap-1 sm:gap-3 items-baseline">
                <dt className="m-0 text-sm font-medium text-gray-500 dark:text-odoo-dark-muted">{t('profile.addressDoor')}</dt>
                <dd className="m-0 text-[0.95rem] text-gray-900 dark:text-odoo-dark-text">{user.addressDoor || '—'}</dd>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-[140px_1fr] gap-1 sm:gap-3 items-baseline">
                <dt className="m-0 text-sm font-medium text-gray-500 dark:text-odoo-dark-muted">{t('profile.postalCode')}</dt>
                <dd className="m-0 text-[0.95rem] text-gray-900 dark:text-odoo-dark-text">{user.postalCode || '—'}</dd>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-[140px_1fr] gap-1 sm:gap-3 items-baseline">
                <dt className="m-0 text-sm font-medium text-gray-500 dark:text-odoo-dark-muted">{t('profile.city')}</dt>
                <dd className="m-0 text-[0.95rem] text-gray-900 dark:text-odoo-dark-text">{user.city || '—'}</dd>
              </div>
            </dl>
          </div>
          <div className="p-4 sm:p-5 rounded-lg border border-gray-200 dark:border-odoo-dark-border bg-gray-50 dark:bg-odoo-dark-surface">
            <h4 className="m-0 mb-4 text-[0.95rem] font-semibold text-gray-700 dark:text-odoo-dark-muted">{t('profile.account')}</h4>
            <dl className="m-0 flex flex-col gap-3">
              <div className="grid grid-cols-1 sm:grid-cols-[140px_1fr] gap-1 sm:gap-3 items-baseline">
                <dt className="m-0 text-sm font-medium text-gray-500 dark:text-odoo-dark-muted">{t('profile.username')}</dt>
                <dd className="m-0 text-[0.95rem] text-gray-900 dark:text-odoo-dark-text">{user.username ?? '—'}</dd>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-[140px_1fr] gap-1 sm:gap-3 items-baseline">
                <dt className="m-0 text-sm font-medium text-gray-500 dark:text-odoo-dark-muted">{t('profile.role')}</dt>
                <dd className="m-0 text-[0.95rem] text-gray-900 dark:text-odoo-dark-text">{user.role ?? '—'}</dd>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-[140px_1fr] gap-1 sm:gap-3 items-baseline">
                <dt className="m-0 text-sm font-medium text-gray-500 dark:text-odoo-dark-muted">{t('profile.bio')}</dt>
                <dd className="m-0 text-[0.95rem] text-gray-900 dark:text-odoo-dark-text whitespace-pre-wrap leading-normal">{user.bio || '—'}</dd>
              </div>
            </dl>
          </div>
        </section>
      ) : (
        <section className="max-w-[600px] mx-auto min-w-0">
          {saveError && (
            <p className="mb-4 py-2 px-3 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 rounded-lg" role="alert">
              {saveError}
            </p>
          )}
          <div className="flex flex-col gap-4 mb-5">
            <FormSection title={t('profile.basicData')}>
              <div className="flex flex-col gap-4">
                <FormField
                  name="name"
                  label={t('auth.name')}
                  type="text"
                  value={formData.name}
                  onChange={handleChange('name')}
                  error={errors.name}
                />
                <FormField
                  name="surname"
                  label={t('auth.surname')}
                  type="text"
                  value={formData.surname}
                  onChange={handleChange('surname')}
                  error={errors.surname}
                />
                <FormField
                  name="dni"
                  label={t('profile.dni')}
                  type="text"
                  value={formData.dni}
                  onChange={handleChange('dni')}
                  error={errors.dni}
                  placeholder={t('profile.placeholderDni')}
                />
                <FormField
                  name="email"
                  label={t('auth.email')}
                  type="email"
                  value={formData.email}
                  onChange={handleChange('email')}
                  error={errors.email}
                />
                <FormField
                  name="phone"
                  label={t('profile.phone')}
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange('phone')}
                  error={errors.phone}
                />
              </div>
            </FormSection>

            <FormSection title={t('profile.address')}>
              <div className="flex flex-col gap-4">
                <FormField
                  name="street"
                  label={t('profile.street')}
                  type="text"
                  value={formData.street}
                  onChange={handleChange('street')}
                  error={errors.street}
                />
                <FormField
                  name="addressNumber"
                  label={t('profile.addressNumber')}
                  type="text"
                  value={formData.addressNumber}
                  onChange={handleChange('addressNumber')}
                  error={errors.addressNumber}
                  inputMode="numeric"
                  pattern="[0-9]*"
                />
                <FormField
                  name="addressFloor"
                  label={t('profile.addressFloor')}
                  type="text"
                  value={formData.addressFloor}
                  onChange={handleChange('addressFloor')}
                  error={errors.addressFloor}
                  optionalLabel={t('profile.optional')}
                  inputMode="numeric"
                  pattern="[0-9]*"
                />
                <FormField
                  name="addressDoor"
                  label={t('profile.addressDoor')}
                  type="text"
                  value={formData.addressDoor}
                  onChange={handleChange('addressDoor')}
                  error={errors.addressDoor}
                  optionalLabel={t('profile.optional')}
                  inputMode="numeric"
                  pattern="[0-9]*"
                />
                <FormField
                  name="postalCode"
                  label={t('profile.postalCode')}
                  type="text"
                  value={formData.postalCode}
                  onChange={handleChange('postalCode')}
                  error={errors.postalCode}
                  placeholder={t('profile.placeholderPostalCode')}
                />
                <FormField
                  name="city"
                  label={t('profile.city')}
                  type="text"
                  value={formData.city}
                  onChange={handleChange('city')}
                  error={errors.city}
                />
              </div>
            </FormSection>

            <FormSection title={t('profile.account')}>
              <div className="flex flex-col gap-4">
                <FormField
                  name="username"
                  label={t('profile.username')}
                  type="text"
                  value={formData.username}
                  onChange={handleChange('username')}
                  error={errors.username}
                />
                <FormField
                  name="role"
                  label={t('profile.role')}
                  type="text"
                  value={formData.role}
                  onChange={handleChange('role')}
                  error={errors.role}
                />
                <FormField
                  name="bio"
                  label={t('profile.bio')}
                  type="textarea"
                  value={formData.bio}
                  onChange={handleChange('bio')}
                  error={errors.bio}
                  rows={3}
                />
              </div>
            </FormSection>
          </div>

          <FormActions>
            <button
              type="button"
              className="w-full sm:w-auto py-2 sm:py-1.5 px-3.5 rounded-full text-sm font-medium cursor-pointer border border-gray-300 dark:border-odoo-dark-border bg-white dark:bg-odoo-dark-surface text-gray-600 dark:text-odoo-dark-text hover:bg-gray-100 dark:hover:bg-odoo-dark-bg disabled:opacity-70"
              onClick={handleCancel}
              disabled={saving}
            >
              {t('profile.cancel')}
            </button>
            <button
              type="button"
              className="w-full sm:w-auto py-2 sm:py-1.5 px-3.5 rounded-full text-sm font-medium cursor-pointer border-none bg-odoo-primary text-gray-50 hover:bg-odoo-primary-hover disabled:opacity-70"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? t('profile.saving') : t('profile.save')}
            </button>
          </FormActions>
        </section>
      )}
    </>
  )
}

export default ProfilePage
