export type CabinAssignmentAlgorithm = "AI" | "manual";

export interface CabinAssignment {
  id: string;
  sessionId: string;
  cabinId: string;
  camperIds: string[];
  algorithm: CabinAssignmentAlgorithm;
  generatedAt: string;
  adminEdited: boolean;
  customFields?: Record<string, any>;
}