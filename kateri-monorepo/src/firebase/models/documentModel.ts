export type DocumentStatus = 'received' | 'pending' | 'approved' | 'rejected';

export interface Document {
  id: string;
  camperId: string;
  type: string; // "medical_form" | "consent" | "insurance_card" | etc.
  uploadedBy: string;
  expiresAt?: string;
  url: string;
  uploadedAt: string;
  status: DocumentStatus;
  customFields?: Record<string, any>;
}
