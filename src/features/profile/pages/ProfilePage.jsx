import { useState } from 'react'
import { useAuth } from '../../../app/auth/AuthContext'
import PageHeader from '../../../shared/components/PageHeader'
import FormField from '../../../shared/components/FormField'
import FormSection from '../../../shared/components/FormSection'
import FormActions from '../../../shared/components/FormActions'
import { updateProfile } from '../api/profileApi'
import { validateProfileForm } from '../lib/profileValidation'
import '../styles/profile.css'

function ProfilePage() {
  const { user, setUser } = useAuth()
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
    return <p>No hay información de usuario disponible.</p>
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

    const { valid, errors: validationErrors } = validateProfileForm(formData)

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
        setSaveError('Error al guardar el perfil. Inténtalo de nuevo.')
        return
      }

      setIsEditing(false)
      setUser(updatedUser)
    } catch (error) {
      setSaveError(error?.message ?? 'Error al guardar el perfil. Inténtalo de nuevo.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <PageHeader
        title={isEditing ? 'Editar perfil' : 'Perfil'}
        subtitle={isEditing ? 'Modifica tus datos' : `Hola, ${[user.name, user.surname].filter(Boolean).join(' ') || user.name}`}
        rightAction={
          !isEditing ? (
            <button type="button" className="profile-edit-button" onClick={handleEdit}>
              Editar
            </button>
          ) : null
        }
      />

      {!isEditing ? (
        <section className="profile-content profile-show">
          <div className="profile-show-group">
            <h4 className="profile-show-group-title">Datos básicos</h4>
            <dl className="profile-show-fields">
              <div className="profile-show-row">
                <dt>Nombre</dt>
                <dd>{user.name ?? '—'}</dd>
              </div>
              <div className="profile-show-row">
                <dt>Apellidos</dt>
                <dd>{user.surname ?? '—'}</dd>
              </div>
              <div className="profile-show-row">
                <dt>DNI</dt>
                <dd>{user.dni || '—'}</dd>
              </div>
              <div className="profile-show-row">
                <dt>Email</dt>
                <dd>{user.email ?? '—'}</dd>
              </div>
              <div className="profile-show-row">
                <dt>Teléfono</dt>
                <dd>{user.phone || '—'}</dd>
              </div>
            </dl>
          </div>
          <div className="profile-show-group">
            <h4 className="profile-show-group-title">Dirección</h4>
            <dl className="profile-show-fields">
              <div className="profile-show-row">
                <dt>Calle</dt>
                <dd>{user.street || '—'}</dd>
              </div>
              <div className="profile-show-row">
                <dt>Número</dt>
                <dd>{user.addressNumber || '—'}</dd>
              </div>
              <div className="profile-show-row">
                <dt>Piso</dt>
                <dd>{user.addressFloor || '—'}</dd>
              </div>
              <div className="profile-show-row">
                <dt>Puerta</dt>
                <dd>{user.addressDoor || '—'}</dd>
              </div>
              <div className="profile-show-row">
                <dt>Código postal</dt>
                <dd>{user.postalCode || '—'}</dd>
              </div>
              <div className="profile-show-row">
                <dt>Población</dt>
                <dd>{user.city || '—'}</dd>
              </div>
            </dl>
          </div>
          <div className="profile-show-group">
            <h4 className="profile-show-group-title">Cuenta</h4>
            <dl className="profile-show-fields">
              <div className="profile-show-row">
                <dt>Usuario (nick)</dt>
                <dd>{user.username ?? '—'}</dd>
              </div>
              <div className="profile-show-row">
                <dt>Rol</dt>
                <dd>{user.role ?? '—'}</dd>
              </div>
              <div className="profile-show-row profile-show-row-bio">
                <dt>Bio</dt>
                <dd>{user.bio || '—'}</dd>
              </div>
            </dl>
          </div>
        </section>
      ) : (
        <section className="profile-content">
          {saveError && (
            <p className="profile-save-error" role="alert">
              {saveError}
            </p>
          )}
          <div className="form">
            <FormSection
              title="Datos básicos"
              className="form-group"
              titleClassName="form-group-title"
            >
              <div className="form-fields">
                <FormField
                  name="name"
                  label="Nombre"
                  type="text"
                  value={formData.name}
                  onChange={handleChange('name')}
                  error={errors.name}
                />
                <FormField
                  name="surname"
                  label="Apellidos"
                  type="text"
                  value={formData.surname}
                  onChange={handleChange('surname')}
                  error={errors.surname}
                />
                <FormField
                  name="dni"
                  label="DNI"
                  type="text"
                  value={formData.dni}
                  onChange={handleChange('dni')}
                  error={errors.dni}
                  placeholder="8 dígitos y una letra"
                />
                <FormField
                  name="email"
                  label="Email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange('email')}
                  error={errors.email}
                />
                <FormField
                  name="phone"
                  label="Teléfono"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange('phone')}
                  error={errors.phone}
                />
              </div>
            </FormSection>

            <FormSection
              title="Dirección"
              className="form-group"
              titleClassName="form-group-title"
            >
              <div className="form-fields">
                <FormField
                  name="street"
                  label="Calle"
                  type="text"
                  value={formData.street}
                  onChange={handleChange('street')}
                  error={errors.street}
                />
                <FormField
                  name="addressNumber"
                  label="Número"
                  type="text"
                  value={formData.addressNumber}
                  onChange={handleChange('addressNumber')}
                  error={errors.addressNumber}
                  inputMode="numeric"
                  pattern="[0-9]*"
                />
                <FormField
                  name="addressFloor"
                  label="Piso"
                  type="text"
                  value={formData.addressFloor}
                  onChange={handleChange('addressFloor')}
                  error={errors.addressFloor}
                  optionalLabel="(opcional)"
                  inputMode="numeric"
                  pattern="[0-9]*"
                />
                <FormField
                  name="addressDoor"
                  label="Puerta"
                  type="text"
                  value={formData.addressDoor}
                  onChange={handleChange('addressDoor')}
                  error={errors.addressDoor}
                  optionalLabel="(opcional)"
                  inputMode="numeric"
                  pattern="[0-9]*"
                />
                <FormField
                  name="postalCode"
                  label="Código postal"
                  type="text"
                  value={formData.postalCode}
                  onChange={handleChange('postalCode')}
                  error={errors.postalCode}
                  placeholder="5 dígitos"
                />
                <FormField
                  name="city"
                  label="Población"
                  type="text"
                  value={formData.city}
                  onChange={handleChange('city')}
                  error={errors.city}
                />
              </div>
            </FormSection>

            <FormSection
              title="Cuenta"
              className="form-group"
              titleClassName="form-group-title"
            >
              <div className="form-fields">
                <FormField
                  name="username"
                  label="Usuario (nick)"
                  type="text"
                  value={formData.username}
                  onChange={handleChange('username')}
                  error={errors.username}
                />
                <FormField
                  name="role"
                  label="Rol"
                  type="text"
                  value={formData.role}
                  onChange={handleChange('role')}
                  error={errors.role}
                />
                <FormField
                  name="bio"
                  label="Bio"
                  type="textarea"
                  value={formData.bio}
                  onChange={handleChange('bio')}
                  error={errors.bio}
                  rows={3}
                />
              </div>
            </FormSection>
          </div>

          <FormActions className="form-actions">
            <button
              type="button"
              className="form-button form-button-secondary"
              onClick={handleCancel}
              disabled={saving}
            >
              Cancelar
            </button>
            <button
              type="button"
              className="form-button form-button-primary"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? 'Guardando...' : 'Guardar'}
            </button>
          </FormActions>
        </section>
      )}
    </>
  )
}

export default ProfilePage
