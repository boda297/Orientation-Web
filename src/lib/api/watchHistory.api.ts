import { httpClient } from '../http/httpClient';
import { extractErrorMessage } from '../http/apiError';
import type {
  WatchHistoryItem,
  UpdateWatchProgressPayload,
  WatchHistoryResponse,
  SingleWatchHistoryResponse,
} from '../../types/watchHistory.types';

export * from '../../types/watchHistory.types';

/**
 * Create or update watch progress
 */
export async function updateWatchProgress(
  payload: UpdateWatchProgressPayload
): Promise<{ message: string; watchHistory: WatchHistoryItem }> {
  try {
    const response = await httpClient.post<{ message: string; watchHistory: WatchHistoryItem }>(
      '/watch-history/progress',
      payload
    );
    return response.data;
  } catch (error) {
    throw new Error(extractErrorMessage(error, 'Failed to update watch progress'));
  }
}

/**
 * Get continue watching items (incomplete content 0 < progress < 90)
 */
export async function getContinueWatching(limit: number = 10): Promise<WatchHistoryResponse> {
  try {
    const response = await httpClient.get<WatchHistoryResponse>(
      '/watch-history/continue-watching',
      {
        params: { limit },
      }
    );
    return response.data || { message: '', items: [], count: 0 };
  } catch (error) {
    // If not authenticated or error, return empty gracefully
    return { message: '', items: [], count: 0 };
  }
}

/**
 * Get all watch history
 */
export async function getWatchHistory(params?: {
  includeCompleted?: boolean;
  limit?: number;
}): Promise<WatchHistoryResponse> {
  try {
    const response = await httpClient.get<WatchHistoryResponse>('/watch-history', {
      params,
    });
    return response.data || { message: '', items: [], count: 0 };
  } catch (error) {
    throw new Error(extractErrorMessage(error, 'Failed to fetch watch history'));
  }
}

/**
 * Get recent watch history (last 24 hours)
 */
export async function getRecentWatchHistory(limit: number = 10): Promise<WatchHistoryResponse> {
  try {
    const response = await httpClient.get<WatchHistoryResponse>('/watch-history/recent', {
      params: { limit },
    });
    return response.data || { message: '', items: [], count: 0 };
  } catch (error) {
    throw new Error(extractErrorMessage(error, 'Failed to fetch recent watch history'));
  }
}

/**
 * Get watch progress for specific content
 */
export async function getWatchProgressByContentId(
  contentId: string
): Promise<SingleWatchHistoryResponse> {
  try {
    const response = await httpClient.get<SingleWatchHistoryResponse>(
      `/watch-history/content/${contentId}`
    );
    return response.data;
  } catch (error) {
    throw new Error(extractErrorMessage(error, 'Failed to fetch watch progress'));
  }
}

/**
 * Mark content as completed (100%)
 */
export async function markContentCompleted(
  contentId: string
): Promise<{ message: string; watchHistory: WatchHistoryItem }> {
  try {
    const response = await httpClient.post<{ message: string; watchHistory: WatchHistoryItem }>(
      `/watch-history/content/${contentId}/complete`
    );
    return response.data;
  } catch (error) {
    throw new Error(extractErrorMessage(error, 'Failed to mark content as completed'));
  }
}

/**
 * Remove specific content from watch history
 */
export async function removeWatchHistory(contentId: string): Promise<{ message: string }> {
  try {
    const response = await httpClient.delete<{ message: string }>(
      `/watch-history/content/${contentId}`
    );
    return response.data;
  } catch (error) {
    throw new Error(extractErrorMessage(error, 'Failed to remove watch history item'));
  }
}

/**
 * Clear all watch history for current user
 */
export async function clearWatchHistory(): Promise<{ message: string }> {
  try {
    const response = await httpClient.delete<{ message: string }>('/watch-history/clear');
    return response.data;
  } catch (error) {
    throw new Error(extractErrorMessage(error, 'Failed to clear watch history'));
  }
}

/** Grouped watch history service */
export const watchHistoryApi = {
  updateProgress: updateWatchProgress,
  getContinueWatching,
  getHistory: getWatchHistory,
  getRecent: getRecentWatchHistory,
  getProgress: getWatchProgressByContentId,
  markCompleted: markContentCompleted,
  remove: removeWatchHistory,
  clear: clearWatchHistory,
};
