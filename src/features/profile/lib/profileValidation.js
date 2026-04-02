const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const DNI_REGEX = /^[0-9]{8}[A-Z]$/i
const PHONE_MIN_DIGITS = 9
const POSTAL_CODE_REGEX = /^[0-9]{5}$/
const NUMERIC_ONLY = /^\d+$/
const STREET_MIN_LENGTH = 4
const HAS_LETTER = /[a-zA-ZáéíóúñÑÀ-ÿ]/

function validateProfileForm(data, t) {
  const errors = {}

  const name = (data.name ?? '').trim()
  if (!name) {
    errors.name = t('profile.validation.nameRequired')
  }

  const surname = (data.surname ?? '').trim()
  if (!surname) {
    errors.surname = t('profile.validation.surnameRequired')
  }

  const username = (data.username ?? '').trim()
  if (!username) {
    errors.username = t('profile.validation.usernameRequired')
  }

  const email = (data.email ?? '').trim()
  if (!email) {
    errors.email = t('profile.validation.emailRequired')
  } else if (!EMAIL_REGEX.test(email)) {
    errors.email = t('profile.validation.emailInvalid')
  }

  const phone = (data.phone ?? '').trim()
  if (!phone) {
    errors.phone = t('profile.validation.phoneRequired')
  } else {
    const digits = phone.replace(/\D/g, '')
    if (digits.length < PHONE_MIN_DIGITS) {
      errors.phone = t('profile.validation.phoneMinDigits', { count: PHONE_MIN_DIGITS })
    }
  }

  const role = (data.role ?? '').trim()
  if (!role) {
    errors.role = t('profile.validation.roleRequired')
  }

  const dni = (data.dni ?? '').trim()
  if (!dni) {
    errors.dni = t('profile.validation.dniRequired')
  } else if (!DNI_REGEX.test(dni)) {
    errors.dni = t('profile.validation.dniFormat')
  }

  const street = (data.street ?? '').trim()
  if (!street) {
    errors.street = t('profile.validation.streetRequired')
  } else if (street.length < STREET_MIN_LENGTH) {
    errors.street = t('profile.validation.streetMinLength', { count: STREET_MIN_LENGTH })
  } else if (!HAS_LETTER.test(street)) {
    errors.street = t('profile.validation.streetHasLetters')
  }

  const addressNumber = (data.addressNumber ?? '').trim()
  if (!addressNumber) {
    errors.addressNumber = t('profile.validation.addressNumberRequired')
  } else if (!NUMERIC_ONLY.test(addressNumber)) {
    errors.addressNumber = t('profile.validation.addressNumberNumeric')
  }

  const addressFloor = (data.addressFloor ?? '').trim()
  if (addressFloor && !NUMERIC_ONLY.test(addressFloor)) {
    errors.addressFloor = t('profile.validation.addressFloorNumeric')
  }

  const addressDoor = (data.addressDoor ?? '').trim()
  if (addressDoor && !NUMERIC_ONLY.test(addressDoor)) {
    errors.addressDoor = t('profile.validation.addressDoorNumeric')
  }

  const postalCode = (data.postalCode ?? '').trim()
  if (!postalCode) {
    errors.postalCode = t('profile.validation.postalCodeRequired')
  } else if (!POSTAL_CODE_REGEX.test(postalCode)) {
    errors.postalCode = t('profile.validation.postalCodeDigits')
  }

  const city = (data.city ?? '').trim()
  if (!city) {
    errors.city = t('profile.validation.cityRequired')
  } else if (city.length < STREET_MIN_LENGTH) {
    errors.city = t('profile.validation.cityMinLength', { count: STREET_MIN_LENGTH })
  } else if (!HAS_LETTER.test(city)) {
    errors.city = t('profile.validation.cityHasLetters')
  }

  const bio = (data.bio ?? '').trim()
  if (!bio) {
    errors.bio = t('profile.validation.bioRequired')
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  }
}

export { validateProfileForm }
