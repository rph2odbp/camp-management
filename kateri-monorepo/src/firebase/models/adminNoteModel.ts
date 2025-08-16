export interface AdminNote {
  id: string;
  camperId: string;
  sessionId?: string;
  authorId: string;
  createdAt: string;
  text: string;
  visibleTo: ('admin' | 'staff')[];
  customFields?: Record<string, any>;
}
