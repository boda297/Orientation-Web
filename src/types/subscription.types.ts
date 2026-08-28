import type { SubscriptionPlan } from './subscription-plan.types';
export * from './subscription-plan.types';

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
// 🗄️ Subscription Records
// ==========================================

export interface ISubscriptionRecord {
  id?: number | string;
  _id?: string;
  userId?: string;
  planId?: string | SubscriptionPlan;
  status?: 'active' | 'pending' | 'expired' | 'cancelled' | string;
  startDate?: Date | string;
  endDate?: Date | string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
  [key: string]: any;
}

export type SubscriptionRecord = ISubscriptionRecord;

/**
 * Response from POST /subscriptions/checkout
 */
export interface CheckoutResponse {
  message?: string;
  checkoutUrl: string;        // Paymob hosted page URL
  subscriptionId?: string;     // Internal subscription record ID
}

/**
 * Response from GET /subscriptions/me
 */
export interface MySubscription {
  subscription: {
    _id: string;
    status: 'active' | 'pending' | 'expired' | 'cancelled' | string;
    planId?: string | SubscriptionPlan;
    expiresAt?: string;
    [key: string]: any;
  } | null;
}

// ==========================================
// 📤 API Responses
// ==========================================

export interface PaymobCheckoutResponse {
  orderId: number;
  merchantOrderId: string;
  paymentToken: string;
  iframeUrl: string;
}
