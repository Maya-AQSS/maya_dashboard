import { describe, it, expect } from 'vitest'
import { mapUserFromApi, mapUserToApi } from './userMapper'

describe('userMapper', () => {
  const apiUser = {
    id: 1,
    name: 'Ana',
    surname: 'López',
    username: 'ana',
    email: 'a@b.co',
    role: 'dev',
    bio: 'Bio',
    phone: '600111222',
    dni: '12345678Z',
    street: 'Calle',
    address_number: '1',
    address_floor: '2',
    address_door: 'A',
    postal_code: '46001',
    city: 'València',
  }

  it('mapUserFromApi devuelve null si no hay usuario', () => {
    expect(mapUserFromApi(null)).toBeNull()
    expect(mapUserFromApi(undefined)).toBeNull()
  })

  it('mapUserFromApi normaliza snake_case y valores por defecto', () => {
    const u = mapUserFromApi(apiUser)
    expect(u.addressNumber).toBe('1')
    expect(u.postalCode).toBe('46001')
    expect(u.phone).toBe('600111222')
  })

  it('mapUserToApi devuelve null si no hay usuario', () => {
    expect(mapUserToApi(null)).toBeNull()
  })

  it('mapUserToApi y mapUserFromApi son inversos en forma', () => {
    const domain = mapUserFromApi(apiUser)
    const apiAgain = mapUserToApi(domain)
    expect(apiAgain.address_number).toBe(apiUser.address_number)
    expect(apiAgain.postal_code).toBe(apiUser.postal_code)
    const round = mapUserFromApi(apiAgain)
    expect(round.email).toBe(domain.email)
    expect(round.postalCode).toBe(domain.postalCode)
  })
})
