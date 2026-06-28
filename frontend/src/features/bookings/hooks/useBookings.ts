import { useQuery } from '@tanstack/react-query'
import { fetchBookings } from '../api/bookingsApi'
import type { Booking } from '../types/booking'

interface UseBookingsResult {
  bookings: Booking[]
  loading: boolean
  error: string | undefined
}

export function useBookings(
  userId: string | undefined,
  from: Date,
  to: Date,
  view?: 'month' | 'week' | 'day' | 'agenda',
): UseBookingsResult {
  const fromMs = from.getTime()
  const toMs = to.getTime()

  const query = useQuery({
    queryKey: ['bookings', userId, fromMs, toMs, view],
    queryFn: () => fetchBookings(userId as string, from, to, view),
    enabled: Boolean(userId),
    staleTime: 60_000,
  })

  return {
    bookings: query.data ?? [],
    loading: query.isLoading,
    error: query.error instanceof Error ? query.error.message : undefined,
  }
}
