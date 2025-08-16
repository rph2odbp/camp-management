export type NotificationType = 'confirmation' | 'reminder' | 'photo_update' | 'custom';

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  scheduledFor: string;
  sent: boolean;
  sentAt?: string;
  subject: string;
  body: string;
  customFields?: Record<string, any>;
}
