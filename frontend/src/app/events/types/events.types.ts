

export type TEventsData = {
  id?: string,
  eventName: string,
  eventDate: string,
  description: string,
  eventLocation: string,
  organizer: string,
  createdDate?: string,
  isRecurring?: boolean,
  recurrenceType?: 'WEEKLY',
  recurrenceDay?: string,
  recurrenceEndDate?: string,
}