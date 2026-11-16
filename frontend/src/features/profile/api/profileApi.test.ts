import { afterEach, describe, expect, it, vi } from 'vitest'

/**
 * updateProfile llama al puente PATCH /me/employee (ODOO_BRIDGE): mockeamos el
 * wrapper local `../../../api/http`, como en los demás tests de api.
 */
vi.mock('../../../api/http', () => ({
  apiFetchJson: vi.fn(),
}))

import { updateProfile } from './profileApi'
import { apiFetchJson } from '../../../api/http'
import { emptyEmployeeForm, type EmployeeFormInput } from '../lib/profileSchema'

describe('updateProfile', () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  it('hace PATCH a /me/employee con los cambios en el cuerpo', async () => {
    const updates: EmployeeFormInput = { ...emptyEmployeeForm, personal_email: 'juan@example.com' }
    vi.mocked(apiFetchJson).mockResolvedValue({ data: updates })

    await updateProfile(updates)

    expect(apiFetchJson).toHaveBeenCalledWith('/me/employee', {
      method: 'PATCH',
      body: updates,
    })
  })

  it('devuelve el data de la respuesta del servidor', async () => {
    // El servidor devuelve el perfil guardado, que puede no coincidir con lo enviado.
    const updates: EmployeeFormInput = { ...emptyEmployeeForm, car_registration_number_1: '1234ABC' }
    const saved: EmployeeFormInput = { ...updates, personal_email: 'guardado@example.com' }
    vi.mocked(apiFetchJson).mockResolvedValue({ data: saved })

    await expect(updateProfile(updates)).resolves.toEqual(saved)
  })

  it('propaga el error del cliente HTTP', async () => {
    vi.mocked(apiFetchJson).mockRejectedValue(new Error('HTTP 422'))

    await expect(updateProfile(emptyEmployeeForm)).rejects.toThrow('HTTP 422')
  })
})
