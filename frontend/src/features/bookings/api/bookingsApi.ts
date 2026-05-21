import { apiGetJson, mapApiError } from '../../../api/http'
import type { Booking, BookingsApiResponse } from '../types/booking'

function toYmd(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export async function fetchBookings(
  userId: string,
  from: Date,
  to: Date,
  view?: 'month' | 'week' | 'day' | 'agenda',
): Promise<Booking[]> {
  if (!userId) throw new Error('bookings.errorLoad')

  const params = new URLSearchParams({ from: toYmd(from), to: toYmd(to) })
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
