import { useQuery } from '@tanstack/react-query'
import { apiGetJson } from '../../../api/http'
import type { AcademicContext } from '@ceedcv-maya/shared-profile-react'

/**
 * Carga el contexto académico del propio usuario logueado.
 * Endpoint: `GET /api/v1/me/academic-context` (montado vía `AcademicContextRoutes::registerMe()`).
 */
export function useMyAcademicContext() {
  return useQuery<AcademicContext>({
    queryKey: ['me', 'academic-context'],
    queryFn: async () => {
      const body = await apiGetJson<{ data: AcademicContext }>('me/academic-context')
      return body.data
    },
    staleTime: 5 * 60 * 1000,
  })
}
