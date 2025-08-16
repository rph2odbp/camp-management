export type RegistrationStatus = 'active' | 'cancelled' | 'waitlist';

export interface CabinMateRequest {
  camperId: string;
  confirmed: boolean;
}

export interface Registration {
  id: string;
  parentId: string;
  camperId: string;
  sessionId: string;
  year: number;
  sections: {
    basic: Record<string, any>;
    medical: Record<string, any>;
    safety: Record<string, any>;
    legal: Record<string, any>;
    [key: string]: any;
  };
  status: RegistrationStatus;
  paymentIds: string[];
  balanceId: string;
  messagePackagePurchased: boolean;
  cabinMateRequests: CabinMateRequest[];
  customFields?: Record<string, any>;
  createdAt: string; // ISO or Firestore Timestamp
  updatedAt: string;
}