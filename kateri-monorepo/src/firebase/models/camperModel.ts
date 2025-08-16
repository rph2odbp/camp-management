import { Timestamp } from 'firebase/firestore';

export interface CamperAdminNote {
  createdBy: string;
  createdAt: Timestamp;
  text: string;
}

export interface CamperProfile {
  medical: Record<string, any>;
  safety: Record<string, any>;
  legal: Record<string, any>;
  schoolGrade: number;
  notes?: { year: number; note: string }[];
}

export interface Camper {
  id: string;
  parentIds: string[];
  name: string;
  birthdate: string; // ISO date
  gender: 'male' | 'female' | 'other';
  profile: CamperProfile;
  profileYear: number;
  documentIds: string[];
  adminNotes?: CamperAdminNote[];
  photoGalleryIds?: string[];
  createdAt: Timestamp;
  customFields?: Record<string, any>;
}