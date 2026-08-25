import { httpClient } from '../http/httpClient';
import { extractErrorMessage } from '../http/apiError';
import { toFormData } from '../http/formData';
import type {
  Developer,
  CreateDeveloperPayload,
  UpdateDeveloperPayload,
  JoinDeveloperPayload,
  CreateDeveloperAccountPayload,
  DeveloperActionResponse,
} from '../../types/developer.types';
import type { Project } from '../../types/projects.types';

export * from '../../types/developer.types';

/**
 * Get all developers
 */
export async function getDevelopers(): Promise<Developer[]> {
  try {
    const response = await httpClient.get<Developer[]>('/developer', {
      cacheTTL: 2 * 60 * 60 * 1000, // 2 hours — developer list changes very rarely
    });
    return Array.isArray(response.data)
      ? response.data
      : ((response.data as any)?.developers || (response.data as any)?.data || []);
  } catch (error) {
    throw new Error(extractErrorMessage(error, 'Failed to fetch developers'));
  }
}

/**
 * Get single developer by ID
 */
export async function getDeveloperById(id: string): Promise<Developer> {
  try {
    const response = await httpClient.get<Developer>(`/developer/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(extractErrorMessage(error, 'Failed to fetch developer'));
  }
}

/**
 * Get logged-in developer profile
 */
export async function getMyDeveloperProfile(): Promise<Developer> {
  try {
    const response = await httpClient.get<Developer>('/developer/me/profile');
    return response.data;
  } catch (error) {
    throw new Error(extractErrorMessage(error, 'Failed to fetch developer profile'));
  }
}

/**
 * Get logged-in developer's projects
 */
export async function getMyDeveloperProjects(): Promise<Project[]> {
  try {
    const response = await httpClient.get<Project[]>('/developer/me/projects');
    return Array.isArray(response.data) ? response.data : ((response.data as any)?.projects || []);
  } catch (error) {
    throw new Error(extractErrorMessage(error, "Failed to fetch developer's projects"));
  }
}

/**
 * Update logged-in developer profile
 */
export async function updateMyDeveloperProfile(
  payload: UpdateDeveloperPayload | FormData
): Promise<Developer> {
  try {
    const data = toFormData(payload as any);
    const response = await httpClient.patch<Developer>('/developer/me/profile', data);
    return response.data;
  } catch (error) {
    throw new Error(extractErrorMessage(error, 'Failed to update developer profile'));
  }
}

/**
 * Create a new developer
 */
export async function createDeveloper(
  payload: CreateDeveloperPayload | FormData
): Promise<Developer> {
  try {
    const data = toFormData(payload as any);
    const response = await httpClient.post<Developer>('/developer', data);
    return response.data;
  } catch (error) {
    throw new Error(extractErrorMessage(error, 'Failed to create developer'));
  }
}

/**
 * Update developer by ID
 */
export async function updateDeveloper(
  id: string,
  payload: UpdateDeveloperPayload | FormData
): Promise<Developer> {
  try {
    const data = toFormData(payload as any);
    const response = await httpClient.patch<Developer>(`/developer/${id}`, data);
    return response.data;
  } catch (error) {
    throw new Error(extractErrorMessage(error, 'Failed to update developer'));
  }
}

/**
 * Update developer's script
 */
export async function updateDeveloperScript(
  id: string,
  script: string
): Promise<Developer> {
  try {
    const response = await httpClient.patch<Developer>(`/developer/${id}/project`, { script });
    return response.data;
  } catch (error) {
    throw new Error(extractErrorMessage(error, 'Failed to update developer script'));
  }
}

/**
 * Delete developer by ID
 */
export async function deleteDeveloper(id: string): Promise<DeveloperActionResponse> {
  try {
    const response = await httpClient.delete<DeveloperActionResponse>(`/developer/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(extractErrorMessage(error, 'Failed to delete developer'));
  }
}

/**
 * Join developer request
 */
export async function joinDeveloper(payload: JoinDeveloperPayload): Promise<{ message: string }> {
  try {
    const response = await httpClient.post<{ message: string }>('/developer/join-developer', payload);
    return response.data;
  } catch (error) {
    throw new Error(extractErrorMessage(error, 'Failed to submit join developer request'));
  }
}

/**
 * Create user account for developer
 */
export async function createDeveloperAccount(payload: CreateDeveloperAccountPayload): Promise<any> {
  try {
    const response = await httpClient.post<any>('/developer/create-account', payload);
    return response.data;
  } catch (error) {
    throw new Error(extractErrorMessage(error, 'Failed to create developer account'));
  }
}

/**
 * Link user to developer
 */
export async function linkUserToDeveloper(developerId: string, userId: string): Promise<Developer> {
  try {
    const response = await httpClient.post<Developer>(`/developer/${developerId}/link-user/${userId}`);
    return response.data;
  } catch (error) {
    throw new Error(extractErrorMessage(error, 'Failed to link user to developer'));
  }
}

/**
 * Unlink user from developer
 */
export async function unlinkUserFromDeveloper(developerId: string): Promise<Developer> {
  try {
    const response = await httpClient.delete<Developer>(`/developer/${developerId}/unlink-user`);
    return response.data;
  } catch (error) {
    throw new Error(extractErrorMessage(error, 'Failed to unlink user from developer'));
  }
}

/** Grouped developer service */
export const developersApi = {
  list: getDevelopers,
  get: getDeveloperById,
  getProfile: getMyDeveloperProfile,
  getProjects: getMyDeveloperProjects,
  updateProfile: updateMyDeveloperProfile,
  create: createDeveloper,
  update: updateDeveloper,
  updateScript: updateDeveloperScript,
  delete: deleteDeveloper,
  join: joinDeveloper,
  createAccount: createDeveloperAccount,
  linkUser: linkUserToDeveloper,
  unlinkUser: unlinkUserFromDeveloper,
};
