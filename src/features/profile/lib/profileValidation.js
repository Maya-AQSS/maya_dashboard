const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const DNI_REGEX = /^[0-9]{8}[A-Z]$/i
const PHONE_MIN_DIGITS = 9
const POSTAL_CODE_REGEX = /^[0-9]{5}$/
const NUMERIC_ONLY = /^\d+$/
const STREET_MIN_LENGTH = 4
const HAS_LETTER = /[a-zA-ZáéíóúñÑÀ-ÿ]/

function validateProfileForm(data) {
  const errors = {}

  const name = (data.name ?? '').trim()
  if (!name) {
    errors.name = 'El nombre es obligatorio.'
  }

  const surname = (data.surname ?? '').trim()
  if (!surname) {
    errors.surname = 'Los apellidos son obligatorios.'
  }

  const username = (data.username ?? '').trim()
  if (!username) {
    errors.username = 'El usuario (nick) es obligatorio.'
  }

  const email = (data.email ?? '').trim()
  if (!email) {
    errors.email = 'El email es obligatorio.'
  } else if (!EMAIL_REGEX.test(email)) {
    errors.email = 'Introduce un email válido.'
  }

  const phone = (data.phone ?? '').trim()
  if (!phone) {
    errors.phone = 'El teléfono es obligatorio.'
  } else {
    const digits = phone.replace(/\D/g, '')
    if (digits.length < PHONE_MIN_DIGITS) {
      errors.phone = `El teléfono debe tener al menos ${PHONE_MIN_DIGITS} dígitos.`
    }
  }

  const role = (data.role ?? '').trim()
  if (!role) {
    errors.role = 'El rol es obligatorio.'
  }

  const dni = (data.dni ?? '').trim()
  if (!dni) {
    errors.dni = 'El DNI es obligatorio.'
  } else if (!DNI_REGEX.test(dni)) {
    errors.dni = 'El DNI debe tener 8 dígitos y una letra.'
  }

  const street = (data.street ?? '').trim()
  if (!street) {
    errors.street = 'La calle es obligatoria.'
  } else if (street.length < STREET_MIN_LENGTH) {
    errors.street = `La calle debe tener al menos ${STREET_MIN_LENGTH} caracteres.`
  } else if (!HAS_LETTER.test(street)) {
    errors.street = 'La calle debe contener letras (no puede ser solo números).'
  }

  const addressNumber = (data.addressNumber ?? '').trim()
  if (!addressNumber) {
    errors.addressNumber = 'El número es obligatorio.'
  } else if (!NUMERIC_ONLY.test(addressNumber)) {
    errors.addressNumber = 'El número debe ser numérico.'
  }

  const addressFloor = (data.addressFloor ?? '').trim()
  if (addressFloor && !NUMERIC_ONLY.test(addressFloor)) {
    errors.addressFloor = 'El piso debe ser numérico.'
  }

  const addressDoor = (data.addressDoor ?? '').trim()
  if (addressDoor && !NUMERIC_ONLY.test(addressDoor)) {
    errors.addressDoor = 'La puerta debe ser numérica.'
  }

  const postalCode = (data.postalCode ?? '').trim()
  if (!postalCode) {
    errors.postalCode = 'El código postal es obligatorio.'
  } else if (!POSTAL_CODE_REGEX.test(postalCode)) {
    errors.postalCode = 'El código postal debe tener 5 dígitos.'
  }

  const city = (data.city ?? '').trim()
  if (!city) {
    errors.city = 'La población es obligatoria.'
  } else if (city.length < STREET_MIN_LENGTH) {
    errors.city = `La población debe tener al menos ${STREET_MIN_LENGTH} caracteres.`
  } else if (!HAS_LETTER.test(city)) {
    errors.city = 'La población debe contener letras (no puede ser solo números).'
  }

  const bio = (data.bio ?? '').trim()
  if (!bio) {
    errors.bio = 'La bio es obligatoria.'
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  }
}

export { validateProfileForm }
