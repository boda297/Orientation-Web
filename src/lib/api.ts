/**
 * Legacy API compatibility layer.
 * Delegates all calls to the new typed API modules in `@/lib/api/*`.
 */

import { getApiUrl, getFileUrl } from './http/url';
import { projectsApi } from './api/projects.api';
import { episodesApi } from './api/episodes.api';
import { filesApi } from './api/files.api';
import { newsApi } from './api/news.api';
import { watchHistoryApi } from './api/watchHistory.api';

export { getApiUrl, getFileUrl };
export * from './api';

export const api = {
  // Watch history
  getContinueWatching: async (limit: number = 10) => {
    return watchHistoryApi.getContinueWatching(limit);
  },

  // Projects
  getProject: async (id: string) => {
    return projectsApi.get(id);
  },
  getFeaturedProjects: async (limit: number = 10) => {
    return projectsApi.getFeatured(limit);
  },
  getProjectsByLocation: async (location: string) => {
    return projectsApi.getByLocation(location);
  },
  getProjects: async (params?: {
    developerId?: string;
    location?: string;
    status?: string;
    title?: string;
    slug?: string;
    limit?: number;
    page?: number;
    sortBy?: 'newest' | 'trending' | 'saveCount' | 'viewCount';
  }) => {
    return projectsApi.list(params);
  },
  getTrendingProjects: async (limit: number = 10) => {
    return projectsApi.getTop10(limit);
  },
  getLatestProjects: async (limit: number = 10) => {
    return projectsApi.getLatest(limit);
  },
  getProjectsByStatus: async (status: string) => {
    return projectsApi.getByStatus(status);
  },

  // Episodes
  getEpisodes: async () => {
    return episodesApi.list();
  },

  // Files
  getInventory: async () => {
    return filesApi.inventory.list();
  },
  getPdfs: async () => {
    return filesApi.pdf.list();
  },

  // News
  getNews: async () => {
    return newsApi.list();
  },
};
