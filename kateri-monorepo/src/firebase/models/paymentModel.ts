export interface PaymentDiscount {
  code: string;
  amount: number;
}

export interface Payment {
  id: string;
  parentId: string;
  registrationId: string;
  amount: number;
  currency: string;
  method: string;
  status: string;
  paymentPlan: string;
  discounts?: PaymentDiscount[];
  scholarship?: number;
  refundIds?: string[];
  createdAt: string;
  updatedAt: string;
  customFields?: Record<string, any>;
}
