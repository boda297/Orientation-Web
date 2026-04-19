// src/lib/dashboardApi.ts
// Clean, typed API layer for all dashboard operations

import { getApiUrl, getFileUrl } from './api';
import { getAccessToken } from './auth';

// ─────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────

export interface ApiError extends Error {
  status?: number;
}

export interface User {
  _id: string;
  id?: string;
  name?: string;
  username?: string;
  email: string;
  role: string;
}

export interface Developer {
  _id: string;
  id?: string;
  name: string;
  tagline?: string;
  description?: string;
  logo?: string;
  thumbnail?: string;
  imageUrl?: string;
}

export interface Episode {
  _id: string;
  title: string;
  episodeOrder?: number | string;
  duration?: string | number;
  thumbnail?: string | null;
  episodeUrl?: string;
  projectId?: string;
}

export interface Reel {
  _id: string;
  title: string;
  thumbnailUrl?: string;
  thumbnail?: string;
  fileUrl?: string;
  likes?: number;
  number?: number;
}

export interface Inventory {
  _id: string;
  title: string;
  fileUrl?: string;
}

export interface Pdf {
  _id: string;
  title: string;
  fileUrl?: string;
  pdfUrl?: string;
  size?: string;
}

export interface Project {
  _id: string;
  id?: string;
  title: string;
  location?: string;
  script?: string;
  status?: string;
  featured?: boolean;
  published?: boolean;
  whatsappNumber?: string;
  mapsLocation?: string;
  logoUrl?: string;
  heroVideoUrl?: string;
  projectThumbnailUrl?: string;
  developer?: { _id: string; name: string; logoUrl?: string } | string;
  episodes?: Episode[];
  reels?: Reel[];
  inventory?: Inventory;
  pdf?: Pdf[];
}

export interface CreateUserPayload {
  name: string;
  email: string;
  password: string;
  role: string;
}

export interface CreateDeveloperPayload {
  name: string;
  tagline?: string;
  logo: File;
}

export interface CreateProjectPayload {
  title: string;
  developer: string;
  location?: string;
  whatsappNumber?: string;
  script?: string;
  projectThumbnailUrl?: File;
  heroImageUrl?: File;
  videoUrl?: File;
  inventoryPdf?: File;
  episodes?: File[];
}

export interface UpdateProjectPayload {
  title?: string;
  developer?: string;
  location?: string;
  whatsappNumber?: string;
  script?: string;
  status?: string;
  featured?: boolean;
  published?: boolean;
  logoUrl?: File;
  videoUrl?: File;
  projectThumbnailUrl?: File;
}

export interface CreateEpisodePayload {
  title: string;
  projectId: string;
  episodeOrder?: string;
  duration?: string;
  thumbnail?: File | null;
  episodeUrl?: File | null;
}

export interface UpdateEpisodePayload {
  title?: string;
  episodeOrder?: string;
  duration?: string;
  thumbnail?: File | null;
  episodeUrl?: File | null;
}

export interface CreateReelPayload {
  title: string;
  projectId: string;
  fileUrl?: File | null;
  thumbnail?: File | null;
}

export interface UpdateReelPayload {
  title?: string;
  fileUrl?: File | null;
  thumbnail?: File | null;
}

export interface CreateInventoryPayload {
  title: string;
  projectId: string;
  file?: File | null;
}

export interface UpdateInventoryPayload {
  title?: string;
  file?: File | null;
}

export interface CreatePdfPayload {
  title: string;
  projectId: string;
  file?: File | null;
}

export interface UpdatePdfPayload {
  title?: string;
  file?: File | null;
}

// ─────────────────────────────────────────────
// BASE REQUEST HELPER
// ─────────────────────────────────────────────

async function request<T>(
  endpoint: string,
  options: RequestInit = {},
  auth = true
): Promise<T> {
  const headers: Record<string, string> = {};

  if (auth) {
    const token = getAccessToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }

  // Merge headers (don't set Content-Type for FormData; browser sets it with boundary)
  const isFormData = options.body instanceof FormData;
  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }

  const res = await fetch(getApiUrl(endpoint), {
    ...options,
    headers: { ...headers, ...((options.headers as Record<string, string>) || {}) },
  });

  if (!res.ok) {
    const payload = await res.json().catch(() => null);
    const err = new Error(
      payload?.message || payload?.error || `Request failed: ${res.status} ${res.statusText}`
    ) as ApiError;
    err.status = res.status;
    throw err;
  }

  // 204 No Content
  if (res.status === 204) return undefined as unknown as T;

  return res.json();
}

function toFormData(data: Record<string, unknown>): FormData {
  const fd = new FormData();
  for (const [key, value] of Object.entries(data)) {
    if (value === undefined || value === null) continue;
    if (value instanceof File) {
      fd.append(key, value);
    } else if (Array.isArray(value)) {
      value.forEach((v) => {
        if (v instanceof File) fd.append(key, v);
        else fd.append(key, String(v));
      });
    } else {
      fd.append(key, String(value));
    }
  }
  return fd;
}

// ─────────────────────────────────────────────
// USERS API
// ─────────────────────────────────────────────

export const usersApi = {
  /** List all users */
  list: (): Promise<User[]> =>
    request<User[]>('/users').then((data) =>
      Array.isArray(data) ? data : ((data as any)?.users || (data as any)?.data || [])
    ),

  /** Create a new user */
  create: (payload: CreateUserPayload): Promise<User> =>
    request<User>('/users', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  /** Delete a user by ID */
  delete: (id: string): Promise<void> =>
    request<void>(`/users/${id}`, { method: 'DELETE' }),
};

// ─────────────────────────────────────────────
// DEVELOPERS API
// ─────────────────────────────────────────────

export const developersApi = {
  /** List all developers */
  list: (): Promise<Developer[]> =>
    request<Developer[]>('/developers', {}, false).then((data) =>
      Array.isArray(data) ? data : ((data as any)?.developers || (data as any)?.data || [])
    ),

  /** Create a new developer (multipart) */
  create: (payload: CreateDeveloperPayload): Promise<Developer> => {
    const fd = toFormData({
      name: payload.name,
      ...(payload.tagline ? { tagline: payload.tagline } : {}),
      logo: payload.logo,
    });
    return request<Developer>('/developers', { method: 'POST', body: fd });
  },

  /** Delete a developer by ID */
  delete: (id: string): Promise<void> =>
    request<void>(`/developers/${id}`, { method: 'DELETE' }),
};

// ─────────────────────────────────────────────
// PROJECTS API
// ─────────────────────────────────────────────

export const projectsApi = {
  /** List all projects */
  list: (): Promise<Project[]> =>
    request<Project[]>('/projects', {}, false).then((data) =>
      Array.isArray(data) ? data : ((data as any)?.projects || (data as any)?.data || [])
    ),

  /** Get a single project */
  get: (id: string): Promise<Project> =>
    request<Project>(`/projects/${id}`, {}, false),

  /** Create a new project (multipart) */
  create: (payload: CreateProjectPayload): Promise<Project> => {
    const fd = toFormData({
      title: payload.title,
      developer: payload.developer,
      ...(payload.location ? { location: payload.location } : {}),
      ...(payload.whatsappNumber ? { whatsappNumber: payload.whatsappNumber } : {}),
      ...(payload.script ? { script: payload.script } : {}),
      ...(payload.projectThumbnailUrl ? { projectThumbnailUrl: payload.projectThumbnailUrl } : {}),
      ...(payload.heroImageUrl ? { heroImageUrl: payload.heroImageUrl } : {}),
      ...(payload.videoUrl ? { videoUrl: payload.videoUrl } : {}),
      ...(payload.inventoryPdf ? { inventoryPdf: payload.inventoryPdf } : {}),
    });
    // Episodes are multi-file
    if (payload.episodes?.length) {
      payload.episodes.forEach((ep) => fd.append('episodes', ep));
    }
    return request<Project>('/projects', { method: 'POST', body: fd });
  },

  /** Update a project (multipart PATCH) */
  update: (id: string, payload: UpdateProjectPayload): Promise<Project> => {
    const data: Record<string, unknown> = { ...payload };
    const fd = toFormData(data);
    return request<Project>(`/projects/${id}`, { method: 'PATCH', body: fd });
  },

  /** Delete a project by ID */
  delete: (id: string): Promise<void> =>
    request<void>(`/projects/${id}`, { method: 'DELETE' }),
};

// ─────────────────────────────────────────────
// EPISODES API
// ─────────────────────────────────────────────

export const episodesApi = {
  /** Create an episode for a project */
  create: (payload: CreateEpisodePayload): Promise<Episode> => {
    const fd = toFormData({
      title: payload.title,
      projectId: payload.projectId,
      ...(payload.episodeOrder ? { episodeOrder: payload.episodeOrder } : {}),
      ...(payload.duration ? { duration: payload.duration } : {}),
      ...(payload.thumbnail ? { thumbnail: payload.thumbnail } : {}),
      ...(payload.episodeUrl ? { episodeUrl: payload.episodeUrl } : {}),
    });
    return request<Episode>('/episode', { method: 'POST', body: fd });
  },

  /** Update an episode */
  update: (id: string, payload: UpdateEpisodePayload): Promise<Episode> => {
    const fd = toFormData({
      ...(payload.title ? { title: payload.title } : {}),
      ...(payload.episodeOrder ? { episodeOrder: payload.episodeOrder } : {}),
      ...(payload.duration ? { duration: payload.duration } : {}),
      ...(payload.thumbnail ? { thumbnail: payload.thumbnail } : {}),
      ...(payload.episodeUrl ? { episodeUrl: payload.episodeUrl } : {}),
    });
    return request<Episode>(`/episode/${id}`, { method: 'PATCH', body: fd });
  },

  /** Delete an episode */
  delete: (id: string): Promise<void> =>
    request<void>(`/episode/${id}`, { method: 'DELETE' }),
};

// ─────────────────────────────────────────────
// REELS API
// ─────────────────────────────────────────────

export const reelsApi = {
  /** Create a reel for a project */
  create: (payload: CreateReelPayload): Promise<Reel> => {
    const fd = toFormData({
      title: payload.title,
      projectId: payload.projectId,
      ...(payload.fileUrl ? { fileUrl: payload.fileUrl } : {}),
      ...(payload.thumbnail ? { thumbnail: payload.thumbnail } : {}),
    });
    return request<Reel>('/reels', { method: 'POST', body: fd });
  },

  /** Update a reel */
  update: (id: string, payload: UpdateReelPayload): Promise<Reel> => {
    const fd = toFormData({
      ...(payload.title ? { title: payload.title } : {}),
      ...(payload.fileUrl ? { fileUrl: payload.fileUrl } : {}),
      ...(payload.thumbnail ? { thumbnail: payload.thumbnail } : {}),
    });
    return request<Reel>(`/reels/${id}`, { method: 'PATCH', body: fd });
  },

  /** Delete a reel */
  delete: (id: string): Promise<void> =>
    request<void>(`/reels/${id}`, { method: 'DELETE' }),
};

// ─────────────────────────────────────────────
// INVENTORY API
// ─────────────────────────────────────────────

export const inventoryApi = {
  /** Upload inventory for a project */
  create: (payload: CreateInventoryPayload): Promise<Inventory> => {
    const fd = toFormData({
      title: payload.title,
      projectId: payload.projectId,
      ...(payload.file ? { file: payload.file } : {}),
    });
    return request<Inventory>('/files/upload/inventory', { method: 'POST', body: fd });
  },

  /** Update an inventory entry */
  update: (id: string, payload: UpdateInventoryPayload): Promise<Inventory> => {
    const fd = toFormData({
      ...(payload.title ? { title: payload.title } : {}),
      ...(payload.file ? { file: payload.file } : {}),
    });
    return request<Inventory>(`/files/inventory/${id}`, { method: 'PATCH', body: fd });
  },

  /** Delete an inventory entry */
  delete: (id: string): Promise<void> =>
    request<void>(`/files/inventory/${id}`, { method: 'DELETE' }),
};

// ─────────────────────────────────────────────
// PDFS API
// ─────────────────────────────────────────────

export const pdfsApi = {
  /** Upload a PDF for a project */
  create: (payload: CreatePdfPayload): Promise<Pdf> => {
    const fd = toFormData({
      title: payload.title,
      projectId: payload.projectId,
      ...(payload.file ? { file: payload.file } : {}),
    });
    return request<Pdf>('/files/upload/pdf', { method: 'POST', body: fd });
  },

  /** Update a PDF entry */
  update: (id: string, payload: UpdatePdfPayload): Promise<Pdf> => {
    const fd = toFormData({
      ...(payload.title ? { title: payload.title } : {}),
      ...(payload.file ? { file: payload.file } : {}),
    });
    return request<Pdf>(`/files/pdf/${id}`, { method: 'PATCH', body: fd });
  },

  /** Delete a PDF entry */
  delete: (id: string): Promise<void> =>
    request<void>(`/files/pdf/${id}`, { method: 'DELETE' }),
};

// ─────────────────────────────────────────────
// RE-EXPORT getFileUrl for convenience
// ─────────────────────────────────────────────
export { getFileUrl };
