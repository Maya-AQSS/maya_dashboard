/**
 * Mapea el usuario desde la API (snake_case) al formato del frontend (camelCase).
 */
function mapUserFromApi(user) {
  if (!user) return null
  return {
    id: user.id,
    name: user.name,
    surname: user.surname,
    username: user.username,
    email: user.email,
    role: user.role,
    bio: user.bio,
    phone: user.phone ?? '',
    dni: user.dni ?? '',
    street: user.street ?? '',
    addressNumber: user.address_number ?? '',
    addressFloor: user.address_floor ?? '',
    addressDoor: user.address_door ?? '',
    postalCode: user.postal_code ?? '',
    city: user.city ?? '',
  }
}

/**
 * Mapea el usuario del frontend (camelCase) al formato de la API (snake_case).
 */
function mapUserToApi(user) {
  if (!user) return null
  return {
    id: user.id,
    name: user.name,
    surname: user.surname,
    username: user.username,
    email: user.email,
    role: user.role,
    bio: user.bio,
    phone: user.phone ?? '',
    dni: user.dni ?? '',
    street: user.street ?? '',
    address_number: user.addressNumber ?? '',
    address_floor: user.addressFloor ?? '',
    address_door: user.addressDoor ?? '',
    postal_code: user.postalCode ?? '',
    city: user.city ?? '',
  }
}

export { mapUserFromApi, mapUserToApi }
