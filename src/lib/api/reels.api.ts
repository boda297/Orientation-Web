import { httpClient } from '../http/httpClient';
import { extractErrorMessage } from '../http/apiError';
import { toFormData } from '../http/formData';
import type {
  Reel,
  CreateReelPayload,
  UpdateReelPayload,
  SavedReelsResponse,
  ReelActionResponse,
} from '../../types/reels.types';

export * from '../../types/reels.types';

/**
 * Get all reels
 */
export async function getReels(): Promise<Reel[]> {
  try {
    const response = await httpClient.get<Reel[]>('/reels');
    return Array.isArray(response.data) ? response.data : ((response.data as any)?.reels || []);
  } catch (error) {
    throw new Error(extractErrorMessage(error, 'Failed to fetch reels'));
  }
}

/**
 * Get reels saved by current user
 */
export async function getSavedReels(): Promise<SavedReelsResponse> {
  try {
    const response = await httpClient.get<SavedReelsResponse>('/reels/saved');
    return response.data;
  } catch (error) {
    throw new Error(extractErrorMessage(error, 'Failed to fetch saved reels'));
  }
}

/**
 * Get single reel by ID
 */
export async function getReelById(id: string): Promise<Reel> {
  try {
    const response = await httpClient.get<Reel>(`/reels/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(extractErrorMessage(error, 'Failed to fetch reel'));
  }
}

/**
 * Upload a new reel (multipart/form-data)
 */
export async function createReel(
  payload: CreateReelPayload | FormData
): Promise<{ message: string; reel: Reel }> {
  try {
    const data = toFormData(payload as any);
    const response = await httpClient.post<{ message: string; reel: Reel }>('/reels', data);
    return response.data;
  } catch (error) {
    throw new Error(extractErrorMessage(error, 'Failed to upload reel'));
  }
}

/**
 * Update a reel by ID
 */
export async function updateReel(
  id: string,
  payload: UpdateReelPayload | FormData
): Promise<{ message: string; reel: Reel }> {
  try {
    const data = toFormData(payload as any);
    const response = await httpClient.patch<{ message: string; reel: Reel }>(`/reels/${id}`, data);
    return response.data;
  } catch (error) {
    throw new Error(extractErrorMessage(error, 'Failed to update reel'));
  }
}

/**
 * Delete a reel by ID
 */
export async function deleteReel(id: string): Promise<{ message: string }> {
  try {
    const response = await httpClient.delete<{ message: string }>(`/reels/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(extractErrorMessage(error, 'Failed to delete reel'));
  }
}

/**
 * Save a reel to bookmarks
 */
export async function saveReel(id: string): Promise<{ message: string; reel: Reel }> {
  try {
    const response = await httpClient.post<{ message: string; reel: Reel }>(`/reels/${id}/save`);
    return response.data;
  } catch (error) {
    throw new Error(extractErrorMessage(error, 'Failed to save reel'));
  }
}

/**
 * Unsave a reel from bookmarks
 */
export async function unsaveReel(id: string): Promise<{ message: string; reel: Reel }> {
  try {
    const response = await httpClient.post<{ message: string; reel: Reel }>(`/reels/${id}/unsave`);
    return response.data;
  } catch (error) {
    throw new Error(extractErrorMessage(error, 'Failed to unsave reel'));
  }
}

/** Grouped reels service */
export const reelsApi = {
  list: getReels,
  getSaved: getSavedReels,
  get: getReelById,
  create: createReel,
  update: updateReel,
  delete: deleteReel,
  save: saveReel,
  unsave: unsaveReel,
};
