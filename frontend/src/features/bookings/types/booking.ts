export interface Booking {
  id: string
  userId: string
  title: string
  resourceId: string | null
  resourceName: string | null
  startAt: Date
  endAt: Date
  allDay: boolean
  status: 'confirmed' | 'pending' | 'cancelled' | string
}

export interface BookingsApiResponse {
  data: Array<{
    id: string
    user_id: string
    title: string
    resource_id: string | null
    resource_name: string | null
    start_at: string
    end_at: string
    all_day: boolean
    status: string
  }>
  meta: {
    from: string
    to: string
    view: string
    count: number
  }
}
