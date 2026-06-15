import { apiFetchJson } from '../../../api/http'
import type { EmployeeFormInput } from '../lib/profileSchema'

// ODOO_BRIDGE — Este módulo llama a un controlador puente temporal.
// Reemplazar la URL y el tipo de retorno cuando Odoo proporcione el API de escritura.
// Ver: MeEmployeeController, UpdateMeEmployeeRequest, migración employee_profile_overrides.
export async function updateProfile(updates: EmployeeFormInput): Promise<EmployeeFormInput> {
  const res = await apiFetchJson<{ data: EmployeeFormInput }>('/me/employee', {
    method: 'PATCH',
    body: updates,
  })
  return res.data
}
