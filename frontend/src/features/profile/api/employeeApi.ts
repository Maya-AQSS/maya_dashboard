import { useAuth } from '@ceedcv-maya/shared-auth-react'
import { useMemo } from 'react'

export interface EmployeeData {
  personal_email: string | null
  position_type: string | null
  supervisor_name: string | null
  mentor_name: string | null
  keys: string | null
  date_keys_handover: string | null
  date_keys_return: string | null
  iban: string | null
  id_card_rfid: string | null
  car_registration_number_1: string | null
  car_registration_number_2: string | null
  car_registration_number_3: string | null
}

interface AuthUserWithEmployee {
  employee?: EmployeeData | null
}

/**
 * Extrae los datos del empleado desde el perfil autenticado (`/me`).
 * El resolver `DashboardProfileResolver` los inyecta bajo la clave `employee`
 * al enriquecer el JWT con la FDW `employee_profiles`.
 */
export function useMyEmployeeData(): { data: EmployeeData | null } {
  const { user } = useAuth()

  const data = useMemo(() => {
    const raw = (user as AuthUserWithEmployee | null)?.employee
    if (!raw) return null
    return raw
  }, [user])

  return { data }
}
