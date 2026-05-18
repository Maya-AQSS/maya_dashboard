import { describe, expect, it } from 'vitest'
import { updateProfile } from './profileApi'

describe('updateProfile', () => {
  it('retorna las actualizaciones tal cual se pasaron', async () => {
    const updates = { firstName: 'Juan', lastName: 'García' }
    const result = await updateProfile(updates)
    expect(result).toEqual(updates)
  })

  it('preserva el tipo genérico', async () => {
    const updates = { locale: 'es', theme: 'dark' }
    const result = await updateProfile(updates)
    expect(result.locale).toBe('es')
    expect(result.theme).toBe('dark')
  })

  it('funciona con objeto vacío', async () => {
    const result = await updateProfile({})
    expect(result).toEqual({})
  })
})
