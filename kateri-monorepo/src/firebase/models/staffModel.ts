export interface StaffCertification {
    type: string;
    expiresAt: string;
  }
  
  export interface StaffApplication {
    id: string;
    userId: string;
    profile: Record<string, any>;
    appliedAt: string;
    status: "pending" | "hired" | "rejected";
    sessionIds: string[];
    certifications?: StaffCertification[];
    trainingCompleted?: string[];
    customFields?: Record<string, any>;
  }
  
  export interface StaffProfile {
    id: string;
    applicationId: string;
    name: string;
    contact: string;
    hireDate: string;
    assignedSessions: string[];
    schedule?: Record<string, any>;
    cabinAssignments?: string[];
    profileComplete: boolean;
    notes?: { year: number; note: string }[];
    customFields?: Record<string, any>;
  }