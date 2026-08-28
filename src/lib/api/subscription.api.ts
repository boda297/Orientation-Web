import { httpClient } from '../http/httpClient';
import { extractErrorMessage } from '../http/apiError';
import type {
  CheckoutResponse,
  MySubscription,
  CreateSubscriptionPlanPayload,
  PaymobCheckoutPayload,
  PaymobCheckoutResponse,
  SubscriptionRecord,
  CreateSubscriptionPayload,
  UpdateSubscriptionPayload,
} from '../../types/subscription.types';

export * from '../../types/subscription.types';

// ==========================================
// 🚀 Subscriptions & Unified Checkout API
// ==========================================

/**
 * Initiate Paymob Checkout via Backend
 * POST /subscriptions/checkout
 */
export async function initiateCheckout(planId: string): Promise<CheckoutResponse> {
  try {
    const response = await httpClient.post<CheckoutResponse>(
      '/subscriptions/checkout',
      { planId }
    );
    return response.data;
  } catch (error) {
    throw new Error(extractErrorMessage(error, 'Failed to initiate checkout'));
  }
}

/**
 * Fetch Current User's Active Subscription
 * GET /subscriptions/me
 */
export async function getMySubscription(): Promise<MySubscription> {
  try {
    const response = await httpClient.get<MySubscription>('/subscriptions/me', {
      skipCache: true,
    });
    return response.data;
  } catch (error) {
    throw new Error(extractErrorMessage(error, 'Failed to fetch subscription status'));
  }
}

/**
 * Retrieve all subscriptions (Admin)
 * GET /subscription
 */
export async function getSubscriptions(): Promise<SubscriptionRecord[]> {
  try {
    const response = await httpClient.get<SubscriptionRecord[]>('/subscription');
    return Array.isArray(response.data) ? response.data : ((response.data as any)?.subscriptions || []);
  } catch (error) {
    throw new Error(extractErrorMessage(error, 'Failed to fetch subscriptions'));
  }
}

/**
 * Retrieve single subscription by ID
 * GET /subscription/:id
 */
export async function getSubscriptionById(id: number | string): Promise<SubscriptionRecord> {
  try {
    const response = await httpClient.get<SubscriptionRecord>(`/subscription/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(extractErrorMessage(error, 'Failed to fetch subscription'));
  }
}

/**
 * Create a new subscription record
 * POST /subscription
 */
export async function createSubscription(
  payload: CreateSubscriptionPayload
): Promise<SubscriptionRecord> {
  try {
    const response = await httpClient.post<SubscriptionRecord>('/subscription', payload);
    return response.data;
  } catch (error) {
    throw new Error(extractErrorMessage(error, 'Failed to create subscription'));
  }
}

/**
 * Update a subscription by ID
 * PATCH /subscription/:id
 */
export async function updateSubscription(
  id: number | string,
  payload: UpdateSubscriptionPayload
): Promise<SubscriptionRecord> {
  try {
    const response = await httpClient.patch<SubscriptionRecord>(`/subscription/${id}`, payload);
    return response.data;
  } catch (error) {
    throw new Error(extractErrorMessage(error, 'Failed to update subscription'));
  }
}

/**
 * Remove a subscription by ID
 * DELETE /subscription/:id
 */
export async function deleteSubscription(id: number | string): Promise<{ message: string }> {
  try {
    const response = await httpClient.delete<{ message: string }>(`/subscription/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(extractErrorMessage(error, 'Failed to delete subscription'));
  }
}

// ==========================================
// 🛠️ Paymob Direct Integration Helpers
// ==========================================

export async function createPaymobPlan(payload: CreateSubscriptionPlanPayload): Promise<any> {
  try {
    const response = await httpClient.post<any>('/subscription/paymob/plan', payload);
    return response.data;
  } catch (error) {
    throw new Error(extractErrorMessage(error, 'Failed to create paymob plan'));
  }
}

export async function getPaymobPlans(): Promise<any[]> {
  try {
    const response = await httpClient.get<any[]>('/subscription/paymob/plans');
    return Array.isArray(response.data) ? response.data : ((response.data as any)?.plans || []);
  } catch (error) {
    throw new Error(extractErrorMessage(error, 'Failed to fetch paymob plans'));
  }
}

export async function createPaymobCheckout(
  payload: PaymobCheckoutPayload
): Promise<PaymobCheckoutResponse> {
  try {
    const response = await httpClient.post<PaymobCheckoutResponse>(
      '/subscription/paymob/checkout',
      payload
    );
    return response.data;
  } catch (error) {
    throw new Error(extractErrorMessage(error, 'Failed to initiate paymob checkout'));
  }
}

/** Grouped Subscriptions Service */
export const subscriptionApi = {
  checkout: initiateCheckout,
  getMySubscription,
  list: getSubscriptions,
  get: getSubscriptionById,
  create: createSubscription,
  update: updateSubscription,
  delete: deleteSubscription,
  createPaymobPlan,
  getPaymobPlans,
  createPaymobCheckout,
};
