export interface CalendarEvent {
  id: string
  title: string
  startTime: Date
  endTime: Date
  description?: string
}

export interface CalendarProvider {
  addEvent(userId: string, event: Omit<CalendarEvent, 'id'>): Promise<string>
  removeEvent(userId: string, eventId: string): Promise<void>
}

export class DefaultCalendarProvider implements CalendarProvider {
  async addEvent(userId: string, event: Omit<CalendarEvent, 'id'>) {
    console.log(`[Calendar] Adding event for ${userId}: ${event.title}`)
    return 'mock-event-id'
  }

  async removeEvent(userId: string, eventId: string) {
    console.log(`[Calendar] Removing event ${eventId} for ${userId}`)
  }
}

export const calendarClient: CalendarProvider = new DefaultCalendarProvider()
