import { httpClient } from '../http/httpClient';
import { extractErrorMessage } from '../http/apiError';
import type { ProjectSv } from '@/types/projects.types';

export interface CreateSvPayload {
  title: string;
  projectId: string;
  file?: File;
  video?: File;
  thumbnail?: File;
}

export interface UpdateSvPayload {
  title?: string;
  file?: File;
  video?: File;
  thumbnail?: File;
}

/**
 * Endpoint for S.V videos.
 * When backend is ready with a specific route (e.g. /sv or /files/sv),
 * update this constant.
 */
const SV_ENDPOINT = '/sv';

export async function getSvFiles(projectId?: string): Promise<ProjectSv[]> {
  try {
    const url = projectId ? `${SV_ENDPOINT}?projectId=${projectId}` : SV_ENDPOINT;
    const response = await httpClient.get<ProjectSv[]>(url);
    return Array.isArray(response.data)
      ? response.data
      : ((response.data as any)?.sv || (response.data as any)?.data || []);
  } catch (error) {
    // Graceful fallback to empty array if backend endpoint is not implemented yet
    console.warn('Could not fetch SV files from backend:', error);
    return [];
  }
}

export async function getSvFileById(id: string): Promise<ProjectSv> {
  try {
    const response = await httpClient.get<ProjectSv>(`${SV_ENDPOINT}/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(extractErrorMessage(error, 'Failed to fetch S.V video'));
  }
}

export async function createSv(
  payload: FormData
): Promise<{ message: string; sv: ProjectSv }> {
  try {
    const response = await httpClient.post<{ message: string; sv: ProjectSv }>(
      SV_ENDPOINT,
      payload
    );
    return response.data;
  } catch (error) {
    throw new Error(extractErrorMessage(error, 'Failed to upload S.V video'));
  }
}

export async function updateSv(
  id: string,
  payload: FormData
): Promise<{ message: string; sv: ProjectSv }> {
  try {
    const response = await httpClient.patch<{ message: string; sv: ProjectSv }>(
      `${SV_ENDPOINT}/${id}`,
      payload
    );
    return response.data;
  } catch (error) {
    throw new Error(extractErrorMessage(error, 'Failed to update S.V video'));
  }
}

export async function deleteSv(id: string): Promise<{ message: string }> {
  try {
    const response = await httpClient.delete<{ message: string }>(`${SV_ENDPOINT}/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(extractErrorMessage(error, 'Failed to delete S.V video'));
  }
}

export const svApi = {
  list: getSvFiles,
  get: getSvFileById,
  create: createSv,
  update: updateSv,
  delete: deleteSv,
};
