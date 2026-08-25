import { httpClient } from '../http/httpClient';
import { extractErrorMessage } from '../http/apiError';
import type {
  CreateSubscriptionPlanPayload,
  PaymobCheckoutPayload,
  PaymobCheckoutResponse,
  SubscriptionRecord,
  CreateSubscriptionPayload,
  UpdateSubscriptionPayload,
} from '../../types/subscription.types';

export * from '../../types/subscription.types';

/**
 * Create a recurring subscription plan on Paymob
 */
export async function createPaymobPlan(payload: CreateSubscriptionPlanPayload): Promise<any> {
  try {
    const response = await httpClient.post<any>('/subscription/paymob/plan', payload);
    return response.data;
  } catch (error) {
    throw new Error(extractErrorMessage(error, 'Failed to create subscription plan'));
  }
}

/**
 * Retrieve all registered subscription plans from Paymob
 */
export async function getPaymobPlans(): Promise<any[]> {
  try {
    const response = await httpClient.get<any[]>('/subscription/paymob/plans');
    return Array.isArray(response.data) ? response.data : ((response.data as any)?.plans || []);
  } catch (error) {
    throw new Error(extractErrorMessage(error, 'Failed to fetch subscription plans'));
  }
}

/**
 * Initiate checkout and get Paymob iframe URL
 */
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
    throw new Error(extractErrorMessage(error, 'Failed to initiate Paymob checkout'));
  }
}

/**
 * Retrieve all subscriptions
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
 */
export async function deleteSubscription(id: number | string): Promise<{ message: string }> {
  try {
    const response = await httpClient.delete<{ message: string }>(`/subscription/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(extractErrorMessage(error, 'Failed to delete subscription'));
  }
}

/** Grouped subscription service */
export const subscriptionApi = {
  createPlan: createPaymobPlan,
  getPlans: getPaymobPlans,
  checkout: createPaymobCheckout,
  list: getSubscriptions,
  get: getSubscriptionById,
  create: createSubscription,
  update: updateSubscription,
  delete: deleteSubscription,
};
