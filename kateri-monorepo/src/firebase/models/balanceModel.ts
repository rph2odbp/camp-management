export type BalanceStatus = "outstanding" | "paid" | "overdue";

export interface Balance {
  id: string;
  parentId: string;
  registrationId: string;
  amountDue: number;
  dueDate: string;
  lastPaymentId: string;
  status: BalanceStatus;
  customFields?: Record<string, any>;
}