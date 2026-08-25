/**
 * Legacy Dashboard API compatibility layer.
 * Re-exports the new typed API modules from `@/lib/api/*`.
 */

import { getFileUrl } from './http/url';
import { usersApi } from './api/users.api';
import { developersApi } from './api/developer.api';
import { projectsApi } from './api/projects.api';
import { episodesApi } from './api/episodes.api';
import { reelsApi } from './api/reels.api';
import { inventoryApi, pdfsApi } from './api/files.api';

export * from '../types/users.types';
export * from '../types/developer.types';
export * from '../types/projects.types';
export * from '../types/episodes.types';
export * from '../types/reels.types';
export * from '../types/files.types';
export * from '../types/upload.types';
export * from '../types/watchHistory.types';
export * from '../types/subscription.types';

export {
  getFileUrl,
  usersApi,
  developersApi,
  projectsApi,
  episodesApi,
  reelsApi,
  inventoryApi,
  pdfsApi,
};

// Aliases for dashboard compatibility
export type User = import('../types/users.types').User;
export type Developer = import('../types/developer.types').Developer;
export type Project = import('../types/projects.types').Project;
export type Episode = import('../types/episodes.types').Episode;
export type Reel = import('../types/reels.types').Reel;
export type Inventory = import('../types/files.types').Inventory;
export type Pdf = import('../types/files.types').PdfFile;