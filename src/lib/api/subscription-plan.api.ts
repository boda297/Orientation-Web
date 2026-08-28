import { httpClient } from '../http/httpClient';
import { extractErrorMessage } from '../http/apiError';
import type {
  SubscriptionPlan,
  CreateSubscriptionPlanDto,
  UpdateSubscriptionPlanDto,
  SubscriptionPlanActionResponse,
} from '../../types/subscription-plan.types';

export * from '../../types/subscription-plan.types';

// ==========================================
// 💳 Subscription Plans API (/api/v1/subscription-plans)
// ==========================================

/**
 * 3.1 Get Active Plans (Public)
 * Fetches all active plans available for subscription, sorted by sortOrder ascending.
 * GET /subscription-plans
 */
export async function getActiveSubscriptionPlans(): Promise<SubscriptionPlan[]> {
  try {
    const response = await httpClient.get<SubscriptionPlan[]>('/subscription-plans', {
      skipCache: true,
    });
    return Array.isArray(response.data)
      ? response.data
      : ((response.data as any)?.plans || (response.data as any)?.data || []);
  } catch (error) {
    throw new Error(extractErrorMessage(error, 'Failed to fetch active subscription plans'));
  }
}

/**
 * 3.2 Get All Plans for Admin
 * Fetches all plans (including inactive/archived) for administration.
 * GET /subscription-plans/admin/all
 * Requires ADMIN or SUPERADMIN role
 */
export async function getAllSubscriptionPlansAdmin(): Promise<SubscriptionPlan[]> {
  try {
    const response = await httpClient.get<SubscriptionPlan[]>('/subscription-plans/admin/all', {
      skipCache: true,
    });
    return Array.isArray(response.data)
      ? response.data
      : ((response.data as any)?.plans || (response.data as any)?.data || []);
  } catch (error) {
    throw new Error(extractErrorMessage(error, 'Failed to fetch admin subscription plans'));
  }
}

/**
 * 3.3 Create a Plan
 * Creates a new plan. Computes vatCents and totalCents automatically on backend.
 * POST /subscription-plans
 * Requires SUPERADMIN role
 */
export async function createSubscriptionPlan(
  dto: CreateSubscriptionPlanDto
): Promise<SubscriptionPlanActionResponse> {
  try {
    const response = await httpClient.post<SubscriptionPlanActionResponse>(
      '/subscription-plans',
      dto
    );
    return response.data;
  } catch (error) {
    throw new Error(extractErrorMessage(error, 'Failed to create subscription plan'));
  }
}

/**
 * 3.4 Update a Plan
 * Updates plan fields. Recalculates vatCents and totalCents on backend if price or VAT changes.
 * PATCH /subscription-plans/:id
 * Requires SUPERADMIN role
 */
export async function updateSubscriptionPlan(
  id: string,
  dto: UpdateSubscriptionPlanDto
): Promise<SubscriptionPlanActionResponse> {
  try {
    const response = await httpClient.patch<SubscriptionPlanActionResponse>(
      `/subscription-plans/${id}`,
      dto
    );
    return response.data;
  } catch (error) {
    throw new Error(extractErrorMessage(error, 'Failed to update subscription plan'));
  }
}

/**
 * 3.5 Archive a Plan (Soft Delete)
 * Sets isActive: false so new users cannot subscribe.
 * DELETE /subscription-plans/:id
 * Requires SUPERADMIN role
 */
export async function archiveSubscriptionPlan(
  id: string
): Promise<SubscriptionPlanActionResponse> {
  try {
    const response = await httpClient.delete<SubscriptionPlanActionResponse>(
      `/subscription-plans/${id}`
    );
    return response.data;
  } catch (error) {
    throw new Error(extractErrorMessage(error, 'Failed to archive subscription plan'));
  }
}

/** Grouped Subscription Plans Service */
export const subscriptionPlansApi = {
  getActivePlans: getActiveSubscriptionPlans,
  getPlans: getActiveSubscriptionPlans,
  getAllPlansAdmin: getAllSubscriptionPlansAdmin,
  create: createSubscriptionPlan,
  createPlan: createSubscriptionPlan,
  update: updateSubscriptionPlan,
  updatePlan: updateSubscriptionPlan,
  archive: archiveSubscriptionPlan,
  archivePlan: archiveSubscriptionPlan,
};
