import { httpClient } from '../http/httpClient';
import { extractErrorMessage } from '../http/apiError';
import { toFormData } from '../http/formData';
import type {
  News,
  CreateNewsPayload,
  UpdateNewsPayload,
} from '../../types/news.types';

export * from '../../types/news.types';

/**
 * Get all news items
 */
export async function getNews(): Promise<News[]> {
  try {
    const response = await httpClient.get<News[]>('/news');
    return Array.isArray(response.data) ? response.data : ((response.data as any)?.news || []);
  } catch (error) {
    throw new Error(extractErrorMessage(error, 'Failed to fetch news'));
  }
}

/**
 * Get single news item by ID
 */
export async function getNewsById(id: string): Promise<News> {
  try {
    const response = await httpClient.get<News>(`/news/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(extractErrorMessage(error, 'Failed to fetch news item'));
  }
}

/**
 * Create a new news item (multipart/form-data)
 */
export async function createNews(
  payload: CreateNewsPayload | FormData
): Promise<News> {
  try {
    const data = toFormData(payload as any);
    const response = await httpClient.post<News>('/news', data);
    return response.data;
  } catch (error) {
    throw new Error(extractErrorMessage(error, 'Failed to create news item'));
  }
}

/**
 * Update a news item by ID
 */
export async function updateNews(
  id: string,
  payload: UpdateNewsPayload | FormData
): Promise<News> {
  try {
    const data = toFormData(payload as any);
    const response = await httpClient.patch<News>(`/news/${id}`, data);
    return response.data;
  } catch (error) {
    throw new Error(extractErrorMessage(error, 'Failed to update news item'));
  }
}

/**
 * Delete a news item by ID
 */
export async function deleteNews(id: string): Promise<News> {
  try {
    const response = await httpClient.delete<News>(`/news/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(extractErrorMessage(error, 'Failed to delete news item'));
  }
}

/** Grouped news service */
export const newsApi = {
  list: getNews,
  get: getNewsById,
  create: createNews,
  update: updateNews,
  delete: deleteNews,
};
