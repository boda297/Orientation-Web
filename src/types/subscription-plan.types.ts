// ==========================================
// 💳 Subscription Plan Schema & DTOs
// ==========================================

/**
 * Subscription Plan Data Model (matches /api/v1/subscription-plans)
 */
export interface SubscriptionPlan {
  _id: string;
  code: string;               // Unique internal identifier (e.g. 'plan_3_months')
  name: string;               // Display name (e.g. 'اشتراك 3 شهور')
  priceCents: number;         // Base price in piastres before VAT (e.g. 9000 = 90 EGP)
  currency: string;           // Currency code (e.g. 'EGP')
  vatPercent: number;         // VAT tax rate percentage (default 14)
  vatCents: number;           // Tax amount in piastres
  totalCents: number;         // Final charged price (priceCents + vatCents)
  durationDays: number;       // Duration in days (e.g. 90, 180, 365)
  features: string[];         // List of features/perks
  isActive: boolean;          // When false, plan is archived
  sortOrder: number;          // Order index in UI (1, 2, 3)
  createdAt?: string;
  updatedAt?: string;
  [key: string]: any;
}

export interface CreateSubscriptionPlanDto {
  code: string;
  name: string;
  priceCents: number;
  currency?: string;
  vatPercent?: number;
  durationDays: number;
  features?: string[];
  isActive?: boolean;
  sortOrder: number;
}

export interface UpdateSubscriptionPlanDto {
  code?: string;
  name?: string;
  priceCents?: number;
  currency?: string;
  vatPercent?: number;
  durationDays?: number;
  features?: string[];
  isActive?: boolean;
  sortOrder?: number;
}

export interface SubscriptionPlanActionResponse {
  message: string;
  plan: SubscriptionPlan;
}
