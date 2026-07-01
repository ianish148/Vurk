export interface NotificationProvider {
  notifyUser(userId: string, title: string, body: string, actionUrl?: string): Promise<void>
}

export class DefaultNotificationProvider implements NotificationProvider {
  async notifyUser(userId: string, title: string, body: string, actionUrl?: string) {
    // In Phase 2 this could just write to the `notifications` table
    // In later phases, this could dispatch an email or push notification
    console.log(`[Notification] To ${userId}: ${title} - ${body}`)
  }
}

export const notificationClient: NotificationProvider = new DefaultNotificationProvider()
