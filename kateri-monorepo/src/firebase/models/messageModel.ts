export type MessageStatus = "queued" | "delivered" | "printed";

export interface Message {
  id: string;
  parentId: string;
  camperId: string;
  registrationId: string;
  message: string;
  createdAt: string;
  status: MessageStatus;
  adminPrinted: boolean;
  attachments?: string[]; // file/photo IDs
  customFields?: Record<string, any>;
}