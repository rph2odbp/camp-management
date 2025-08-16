export type UserRole = 'parent' | 'admin' | 'staff' | 'guardian';

export interface User {
  uid: string;
  email: string;
  role: UserRole;
  name: string;
  phone: string;
  address: {
    street?: string;
    city?: string;
    state?: string;
    zip?: string;
    [key: string]: any;
  };
  createdAt: string; // ISO or Firestore Timestamp
  profileComplete: boolean;
  linkedCamperIds: string[];
  notificationPrefs: {
    emailConfirmations?: boolean;
    paymentReminders?: boolean;
    photoUpdates?: boolean;
    marketing?: boolean;
    [key: string]: boolean;
  };
  guardianStatus?: 'primary' | 'secondary' | 'emergency';
  lastLogin?: string;
  customFields?: Record<string, any>;
}
