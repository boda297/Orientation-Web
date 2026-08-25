import { httpClient } from '../http/httpClient';
import { extractErrorMessage } from '../http/apiError';
import { toFormData } from '../http/formData';
import type {
  Episode,
  CreateEpisodePayload,
  UpdateEpisodePayload,
  EpisodeActionResponse,
} from '../../types/episodes.types';

export * from '../../types/episodes.types';

/**
 * Get all episodes
 */
export async function getEpisodes(): Promise<Episode[]> {
  try {
    const response = await httpClient.get<Episode[]>('/episode');
    return Array.isArray(response.data) ? response.data : ((response.data as any)?.episodes || []);
  } catch (error) {
    throw new Error(extractErrorMessage(error, 'Failed to fetch episodes'));
  }
}

/**
 * Get single episode by ID
 */
export async function getEpisodeById(id: string): Promise<Episode> {
  try {
    const response = await httpClient.get<Episode>(`/episode/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(extractErrorMessage(error, 'Failed to fetch episode'));
  }
}

/**
 * Create a new episode (multipart/form-data)
 */
export async function createEpisode(
  payload: CreateEpisodePayload | FormData
): Promise<{ message: string; episode: Episode }> {
  try {
    const data = toFormData(payload as any);
    const response = await httpClient.post<{ message: string; episode: Episode }>('/episode', data);
    return response.data;
  } catch (error) {
    throw new Error(extractErrorMessage(error, 'Failed to upload episode'));
  }
}

/**
 * Update an episode by ID
 */
export async function updateEpisode(
  id: string,
  payload: UpdateEpisodePayload | FormData
): Promise<{ message: string; episode: Episode }> {
  try {
    const data = toFormData(payload as any);
    const response = await httpClient.patch<{ message: string; episode: Episode }>(`/episode/${id}`, data);
    return response.data;
  } catch (error) {
    throw new Error(extractErrorMessage(error, 'Failed to update episode'));
  }
}

/**
 * Delete an episode by ID
 */
export async function deleteEpisode(id: string): Promise<{ message: string }> {
  try {
    const response = await httpClient.delete<{ message: string }>(`/episode/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(extractErrorMessage(error, 'Failed to delete episode'));
  }
}

/** Grouped episode service */
export const episodesApi = {
  list: getEpisodes,
  get: getEpisodeById,
  create: createEpisode,
  update: updateEpisode,
  delete: deleteEpisode,
};
