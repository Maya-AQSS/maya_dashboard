import { useQuery } from '@tanstack/react-query'
import { apiGetJson } from '../../../api/http'

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

export function useMyEmployeeData() {
  return useQuery<EmployeeData>({
    queryKey: ['me', 'employee'],
    queryFn: async () => {
      const body = await apiGetJson<{ data: EmployeeData }>('me/employee')
      return body.data
    },
    staleTime: 5 * 60 * 1000,
    retry: false,
  })
}
