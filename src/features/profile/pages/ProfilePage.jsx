import { useState } from 'react'
import { useAuth } from '../../../app/auth/AuthContext'
import PageHeader from '../../../shared/components/PageHeader'
import { updateProfile } from '../api/profileApi'
import { validateProfileForm } from '../lib/profileValidation'
import '../styles/profile.css'

function ProfilePage() {
  const { user, setUser } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [errors, setErrors] = useState({})
  const [saveError, setSaveError] = useState(null)
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
    }
  }

  return (
    <>
      <PageHeader
        title="Perfil"
        subtitle={`Hola, ${[user.name, user.surname].filter(Boolean).join(' ') || user.name}`}
        rightAction={
          !isEditing ? (
            <button type="button" className="profile-edit-button" onClick={handleEdit}>
              Editar
            </button>
          ) : null
        }
      />

      {!isEditing ? (
        <section className="profile-content">
          <h3>Datos básicos</h3>
          <p><strong>Nombre:</strong> {user.name}</p>
          <p><strong>Apellidos:</strong> {user.surname ?? '—'}</p>
          <p><strong>DNI:</strong> {user.dni || '—'}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Teléfono:</strong> {user.phone || '—'}</p>
          <h3 className="profile-subsection">Dirección</h3>
          <p><strong>Calle:</strong> {user.street || '—'}</p>
          <p><strong>Número:</strong> {user.addressNumber || '—'}</p>
          <p><strong>Piso:</strong> {user.addressFloor || '—'}</p>
          <p><strong>Puerta:</strong> {user.addressDoor || '—'}</p>
          <p><strong>Código postal:</strong> {user.postalCode || '—'}</p>
          <p><strong>Población:</strong> {user.city || '—'}</p>
          <p><strong>Usuario (nick):</strong> {user.username}</p>
          <p><strong>Rol:</strong> {user.role}</p>
          <p><strong>Bio:</strong> {user.bio || '—'}</p>
        </section>
      ) : (
        <section className="profile-content profile-form-section">
          <h3>Editar datos</h3>
          {saveError && (
            <p className="profile-save-error" role="alert">
              {saveError}
            </p>
          )}
          <div className="profile-form">
            <label>
              Nombre
              <input
                type="text"
                value={formData.name}
                onChange={handleChange('name')}
                className={`profile-input ${errors.name ? 'profile-input-invalid' : ''}`}
                aria-invalid={Boolean(errors.name)}
                aria-describedby={errors.name ? 'error-name' : undefined}
              />
              {errors.name && (
                <span id="error-name" className="profile-field-error" role="alert">
                  {errors.name}
                </span>
              )}
            </label>
            <label>
              Apellidos
              <input
                type="text"
                value={formData.surname}
                onChange={handleChange('surname')}
                className={`profile-input ${errors.surname ? 'profile-input-invalid' : ''}`}
                aria-invalid={Boolean(errors.surname)}
                aria-describedby={errors.surname ? 'error-surname' : undefined}
              />
              {errors.surname && (
                <span id="error-surname" className="profile-field-error" role="alert">
                  {errors.surname}
                </span>
              )}
            </label>
            <label>
              DNI
              <input
                type="text"
                value={formData.dni}
                onChange={handleChange('dni')}
                placeholder="8 dígitos y una letra"
                className={`profile-input ${errors.dni ? 'profile-input-invalid' : ''}`}
                aria-invalid={Boolean(errors.dni)}
                aria-describedby={errors.dni ? 'error-dni' : undefined}
              />
              {errors.dni && (
                <span id="error-dni" className="profile-field-error" role="alert">
                  {errors.dni}
                </span>
              )}
            </label>
            <label>
              Email
              <input
                type="email"
                value={formData.email}
                onChange={handleChange('email')}
                className={`profile-input ${errors.email ? 'profile-input-invalid' : ''}`}
                aria-invalid={Boolean(errors.email)}
                aria-describedby={errors.email ? 'error-email' : undefined}
              />
              {errors.email && (
                <span id="error-email" className="profile-field-error" role="alert">
                  {errors.email}
                </span>
              )}
            </label>
            <label>
              Teléfono
              <input
                type="tel"
                value={formData.phone}
                onChange={handleChange('phone')}
                className={`profile-input ${errors.phone ? 'profile-input-invalid' : ''}`}
                aria-invalid={Boolean(errors.phone)}
                aria-describedby={errors.phone ? 'error-phone' : undefined}
              />
              {errors.phone && (
                <span id="error-phone" className="profile-field-error" role="alert">
                  {errors.phone}
                </span>
              )}
            </label>
            <h4 className="profile-form-section-title">Dirección</h4>
            <label>
              Calle
              <input
                type="text"
                value={formData.street}
                onChange={handleChange('street')}
                className={`profile-input ${errors.street ? 'profile-input-invalid' : ''}`}
                aria-invalid={Boolean(errors.street)}
                aria-describedby={errors.street ? 'error-street' : undefined}
              />
              {errors.street && (
                <span id="error-street" className="profile-field-error" role="alert">
                  {errors.street}
                </span>
              )}
            </label>
            <label>
              Número
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={formData.addressNumber}
                onChange={handleChange('addressNumber')}
                className={`profile-input ${errors.addressNumber ? 'profile-input-invalid' : ''}`}
                aria-invalid={Boolean(errors.addressNumber)}
                aria-describedby={errors.addressNumber ? 'error-addressNumber' : undefined}
              />
              {errors.addressNumber && (
                <span id="error-addressNumber" className="profile-field-error" role="alert">
                  {errors.addressNumber}
                </span>
              )}
            </label>
         
            <label>
              Piso (opcional)
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={formData.addressFloor}
                onChange={handleChange('addressFloor')}
                className={`profile-input ${errors.addressFloor ? 'profile-input-invalid' : ''}`}
                aria-invalid={Boolean(errors.addressFloor)}
                aria-describedby={errors.addressFloor ? 'error-addressFloor' : undefined}
              />
              {errors.addressFloor && (
                <span id="error-addressFloor" className="profile-field-error" role="alert">
                  {errors.addressFloor}
                </span>
              )}
            </label>
            <label>
              Puerta (opcional)
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={formData.addressDoor}
                onChange={handleChange('addressDoor')}
                className={`profile-input ${errors.addressDoor ? 'profile-input-invalid' : ''}`}
                aria-invalid={Boolean(errors.addressDoor)}
                aria-describedby={errors.addressDoor ? 'error-addressDoor' : undefined}
              />
              {errors.addressDoor && (
                <span id="error-addressDoor" className="profile-field-error" role="alert">
                  {errors.addressDoor}
                </span>
              )}
            </label>
            <label>
              Código postal
              <input
                type="text"
                value={formData.postalCode}
                onChange={handleChange('postalCode')}
                placeholder="5 dígitos"
                className={`profile-input ${errors.postalCode ? 'profile-input-invalid' : ''}`}
                aria-invalid={Boolean(errors.postalCode)}
                aria-describedby={errors.postalCode ? 'error-postalCode' : undefined}
              />
              {errors.postalCode && (
                <span id="error-postalCode" className="profile-field-error" role="alert">
                  {errors.postalCode}
                </span>
              )}
            </label>
            <label>
              Población
              <input
                type="text"
                value={formData.city}
                onChange={handleChange('city')}
                className={`profile-input ${errors.city ? 'profile-input-invalid' : ''}`}
                aria-invalid={Boolean(errors.city)}
                aria-describedby={errors.city ? 'error-city' : undefined}
              />
              {errors.city && (
                <span id="error-city" className="profile-field-error" role="alert">
                  {errors.city}
                </span>
              )}
            </label>
            <label>
              Usuario (nick)
              <input
                type="text"
                value={formData.username}
                onChange={handleChange('username')}
                className={`profile-input ${errors.username ? 'profile-input-invalid' : ''}`}
                aria-invalid={Boolean(errors.username)}
                aria-describedby={errors.username ? 'error-username' : undefined}
              />
              {errors.username && (
                <span id="error-username" className="profile-field-error" role="alert">
                  {errors.username}
                </span>
              )}
            </label>
            <label>
              Rol
              <input
                type="text"
                value={formData.role}
                onChange={handleChange('role')}
                className={`profile-input ${errors.role ? 'profile-input-invalid' : ''}`}
                aria-invalid={Boolean(errors.role)}
                aria-describedby={errors.role ? 'error-role' : undefined}
              />
              {errors.role && (
                <span id="error-role" className="profile-field-error" role="alert">
                  {errors.role}
                </span>
              )}
            </label>
            <label>
              Bio
              <textarea
                value={formData.bio}
                onChange={handleChange('bio')}
                className={`profile-input profile-textarea ${errors.bio ? 'profile-input-invalid' : ''}`}
                rows={3}
                aria-invalid={Boolean(errors.bio)}
                aria-describedby={errors.bio ? 'error-bio' : undefined}
              />
              {errors.bio && (
                <span id="error-bio" className="profile-field-error" role="alert">
                  {errors.bio}
                </span>
              )}
            </label>
          </div>
          <div className="profile-form-actions">
            <button
              type="button"
              className="profile-button profile-button-secondary"
              onClick={handleCancel}
            >
              Cancelar
            </button>
            <button
              type="button"
              className="profile-button profile-button-primary"
              onClick={handleSave}
            >
              Guardar
            </button>
          </div>
        </section>
      )}
    </>
  )
}

export default ProfilePage
