import { apiGetJson, mapApiError } from '../../../api/http'
import { formatYmd } from '../../../lib/dateUtils'
import type { Booking, BookingsApiResponse } from '../types/booking'

export async function fetchBookings(
  userId: string,
  from: Date,
  to: Date,
  view?: 'month' | 'week' | 'day' | 'agenda',
): Promise<Booking[]> {
  if (!userId) throw new Error('bookings.errorLoad')

  const params = new URLSearchParams({ from: formatYmd(from), to: formatYmd(to) })
  if (view) params.set('view', view)

  try {
    const response = await apiGetJson<BookingsApiResponse>(
      `/dashboard/user/${encodeURIComponent(userId)}/bookings?${params.toString()}`,
    )
    return response.data.map((row) => ({
      id: row.id,
      userId: row.user_id,
      title: row.title,
      resourceId: row.resource_id,
      resourceName: row.resource_name,
      startAt: new Date(row.start_at),
      endAt: new Date(row.end_at),
      allDay: row.all_day,
      status: row.status,
    }))
  } catch (err) {
    throw mapApiError(err, 'bookings')
  }
}
