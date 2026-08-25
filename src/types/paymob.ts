// ==========================================
// 📥 Request Payloads
// ==========================================

export interface PaymobBillingData {
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  street?: string;
  building?: string;
  floor?: string;
  apartment?: string;
  city?: string;
  country?: string;
  state?: string;
}

export interface PaymobIntentionPayload {
  amount: number; // Cent-based value (e.g. 106.76 EGP = 10676 cents)
  currency: string; // "EGP"
  payment_methods?: (number | string)[];
  billing_data: PaymobBillingData;
  special_reference: string; // Unique internal order ID
  notification_url?: string;
  redirection_url?: string;
  items?: Array<{
    name: string;
    amount: number;
    description?: string;
    quantity?: number;
  }>;
}

export interface CreateIntentionApiRequest {
  planId: string;
  amount: number; // In EGP (e.g. 106.76)
  currency?: string;
  customer: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  orderId?: string;
  description?: string;
}

// ==========================================
// 🗄️ Data Interface
// ==========================================

export interface ISubscriptionPlan {
  id: '3months' | '6months' | '1year';
  title: string;
  duration: string;
  basePrice: number;
  vatAndFees: number;
  totalAmount: number; // In EGP
  badge?: string;
  isPopular?: boolean;
  disabled?: boolean;
  disabledReason?: string;
}

export type SubscriptionPlan = ISubscriptionPlan;

// ==========================================
// 📤 API Responses
// ==========================================

export interface PaymobIntentionResponse {
  id: string | number;
  client_secret: string;
  amount: number;
  currency: string;
  special_reference?: string;
  status?: string;
  created_at?: string;
  detail?: string; // Present on error
  message?: string; // Present on error
}

export interface CreateIntentionApiResponse {
  success: boolean;
  clientSecret?: string;
  checkoutUrl?: string;
  intentionId?: string | number;
  error?: string;
}
