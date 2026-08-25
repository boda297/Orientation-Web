// ==========================================
// 📥 Request Payloads
// ==========================================

export interface PaymobBillingData {
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  apartment?: string;
  floor?: string;
  street?: string;
  building?: string;
  shipping_method?: string;
  postal_code?: string;
  city?: string;
  country?: string;
  state?: string;
}

export interface CreateSubscriptionPlanPayload {
  name: string;
  amount_cents: number;
  frequency: number;
  plan_type?: 'rent' | 'installment' | 'regular' | string;
  webhook_url?: string;
  reminder_days?: number | string;
  retrial_days?: number | string;
  number_of_deductions?: number | string;
  use_transaction_amount?: boolean;
  is_active?: boolean;
  integration?: number;
  fee?: number | string;
}

export interface PaymobCheckoutPayload {
  amountCents: number;
  merchantOrderId?: string;
  billingData?: PaymobBillingData;
}

export interface CreateSubscriptionPayload {
  [key: string]: any;
}

export interface UpdateSubscriptionPayload {
  [key: string]: any;
}

// ==========================================
// 🗄️ Data Interface
// ==========================================

export interface ISubscriptionRecord {
  id?: number | string;
  _id?: string;
  userId?: string;
  planId?: string;
  status?: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
  [key: string]: any;
}

export type SubscriptionRecord = ISubscriptionRecord;

// ==========================================
// 📤 API Responses
// ==========================================

export interface PaymobCheckoutResponse {
  orderId: number;
  merchantOrderId: string;
  paymentToken: string;
  iframeUrl: string;
}
