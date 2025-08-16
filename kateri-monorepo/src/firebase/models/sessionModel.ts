export interface Session {
  id: string;
  name: string;
  description: string;
  startDate: string; // ISO date
  endDate: string; // ISO date
  gender: 'male' | 'female';
  fee: number; // minor units
  depositRequired: number;
  enrollmentLimit: number;
  registrationIds: string[];
  waitlistIds: string[];
  cabinAssignments: Record<string, string[]>; // { cabinId: [camperId] }
  cabinMateRequests: {
    camperId: string;
    requestedIds: string[];
    confirmed: Record<string, boolean>;
  }[];
  photosGalleryId?: string;
  activities: string[];
  customFields?: Record<string, any>;
  adminNotes?: string;
  paymentDueDate: string; // ISO date
}
