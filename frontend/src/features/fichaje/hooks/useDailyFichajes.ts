import { useQuery } from '@tanstack/react-query'
import { apiGetJson, mapApiError } from '../../../api/http'
import { formatYmd } from '../../../lib/dateUtils'
import type { FichajeEntry } from '../lib/pairEntries'

interface AttendanceRow {
  id: string
  user_id: string
  check_in: string
  check_out: string | null
  source: string | null
}

interface AttendancesResponse {
  data: AttendanceRow[]
  meta: { date: string; count: number }
}

/**
 * Expande filas `attendances` (1 fila = check_in + check_out opcional) en la
 * lista de eventos `FichajeEntry` que consume `pairEntries`: cada check_in es
 * una entrada 'in' y cada check_out no nulo es una 'out'. El pairing del UI
 * sigue siendo responsabilidad de `pairEntries`.
 */
function rowsToEntries(rows: readonly AttendanceRow[]): FichajeEntry[] {
  const entries: FichajeEntry[] = []
  for (const row of rows) {
    entries.push({ type: 'in', timestamp: new Date(row.check_in) })
    if (row.check_out) {
      entries.push({ type: 'out', timestamp: new Date(row.check_out) })
    }
  }
  return entries
}

async function fetchDailyAttendances(userId: string, date: Date): Promise<AttendanceRow[]> {
  if (!userId) throw new Error('dashboard.fichaje.errorLoad')
  const ymd = formatYmd(date)
  try {
    const response = await apiGetJson<AttendancesResponse>(
      `/dashboard/user/${encodeURIComponent(userId)}/attendances?date=${ymd}`,
    )
    return response.data
  } catch (err) {
    throw mapApiError(err, 'dashboard.fichaje')
  }
}

interface UseDailyFichajesReturn {
  entries: FichajeEntry[]
  loading: boolean
  error: string | undefined
}

function useDailyFichajes(userId: string | undefined, date: Date): UseDailyFichajesReturn {
  const dateKey = formatYmd(date)

  const query = useQuery({
    queryKey: ['daily-fichajes', userId, dateKey],
    queryFn: () => fetchDailyAttendances(userId as string, date),
    enabled: Boolean(userId),
    staleTime: 60_000,
  })

  return {
    entries: query.data ? rowsToEntries(query.data) : [],
    loading: query.isLoading,
    error: query.error instanceof Error ? query.error.message : undefined,
  }
}

export default useDailyFichajes
