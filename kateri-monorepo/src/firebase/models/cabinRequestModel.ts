export type CabinRequestStatus = 'pending' | 'approved' | 'rejected';

export interface CabinRequest {
  id: string;
  registrationId: string;
  requestedCamperIds: string[];
  confirmations: Record<string, boolean>;
  status: CabinRequestStatus;
  customFields?: Record<string, any>;
}
