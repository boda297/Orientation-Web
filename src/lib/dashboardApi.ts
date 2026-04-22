// src/lib/dashboardApi.ts
// Clean, typed API layer for all dashboard operations perfectly synced with backend docs

import { getApiUrl, getFileUrl } from './api';
import { getAccessToken } from './auth';
import { fetchWithAuth } from './fetchWithAuth';

// ─────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────

export interface ApiError extends Error {
  status?: number;
}

export interface User {
  _id: string;
  username: string;
  email: string;
  phoneNumber: string;
  role: string;
}

export interface Developer {
  _id: string;
  name: string;
  logo?: string;
  email?: string;
  phone?: string;
  location: string;
}

export interface Episode {
  _id: string;
  title: string;
  episodeOrder: number | string;
  duration: string | number;
  thumbnail?: string;
  episodeUrl: string;
  projectId: string;
}

export interface Reel {
  _id: string;
  title: string;
  thumbnailUrl?: string;
  thumbnail?: string;
  videoUrl?: string;
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
}

export interface Project {
  _id: string;
  title: string;
  location: string;
  script: string;
  status: string;
  featured?: boolean;
  published?: boolean;
  whatsappNumber?: string;
  mapsLocation?: string;
  logoUrl?: string;
  heroVideoUrl: string;
  projectThumbnailUrl: string;
  developer?: { _id: string; name: string; logoUrl?: string } | string;
}

export interface CreateUserPayload {
  username: string;
  email: string;
  password: string;
  phoneNumber: string;
}

export interface UpdateUserPayload {
  username?: string;
  email?: string;
  phoneNumber?: string;
  role?: string;
  password?: string;
}

export interface UpdateDeveloperPayload {
  name?: string;
  location?: string;
  email?: string;
  phone?: string;
  socialMediaLink?: string;
}

export interface CreateDeveloperPayload {
  name: string;
  location: string;
  email?: string;
  phone?: string;
  socialMediaLink?: string;
}

export interface CreateProjectPayload {
  title: string;
  developer: string;
  location: string;
  script: string;
  whatsappNumber?: string;
  mapsLocation?: string;
  status?: string;
  featured?: boolean;
  published?: boolean;
  projectThumbnail?: File; 
  heroVideo: File; 
  logo?: File; 
}

export interface UpdateProjectPayload {
  title?: string;
  developer?: string;
  location?: string;
  script?: string;
  whatsappNumber?: string;
  status?: string;
  featured?: boolean;
  published?: boolean;
  mapsLocation?: string;
  projectThumbnail?: File;
  heroVideo?: File;
  logo?: File;
}

export interface CreateEpisodePayload {
  title: string;
  projectId: string;
  episodeOrder: string;
  duration: string;
  thumbnail?: File | null;
  episodeFile: File;
}

export interface UpdateEpisodePayload {
  title?: string;
  episodeOrder?: number;
  duration?: number;
  thumbnail?: File | null;
  episodeFile?: File | null;
}

export interface CreateReelPayload {
  title: string;
  projectId: string;
  file: File;
  thumbnail: File;
}

export interface UpdateReelPayload {
  title?: string;
  projectId?: string;
  file?: File | null;
  thumbnail?: File | null;
}

export interface CreateInventoryPayload {
  title: string;
  projectId: string;
  inventory: File;
}

export interface UpdateInventoryPayload {
  title?: string;
  inventory?: File | null;
}

export interface CreatePdfPayload {
  title: string;
  projectId: string;
  PDF: File;
}

export interface UpdatePdfPayload {
  title?: string;
  PDF?: File | null;
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

  const isFormData = options.body instanceof FormData;
  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }

  const res = await fetchWithAuth(getApiUrl(endpoint), {
    ...options,
    headers: { ...headers, ...((options.headers as Record<string, string>) || {}) },
    auth,
  });

  if (!res.ok) {
    const payload = await res.json().catch(() => null);
    const err = new Error(
      payload?.message || payload?.error || `Request failed: ${res.status} ${res.statusText}`
    ) as ApiError;
    err.status = res.status;
    throw err;
  }

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
// API ENDPOINTS
// ─────────────────────────────────────────────

export const usersApi = {
  list: (): Promise<User[]> =>
    request<User[]>('/users').then((data) =>
      Array.isArray(data) ? data : ((data as any)?.users || (data as any)?.data || [])
    ),
  get: (id: string): Promise<User> =>
    request<User>(`/users/${id}`),
  create: (payload: CreateUserPayload): Promise<User> =>
    request<User>('/users', { method: 'POST', body: JSON.stringify(payload) }),
  update: (id: string, payload: UpdateUserPayload): Promise<User> =>
    request<User>(`/users/${id}`, { method: 'PATCH', body: JSON.stringify(payload) }),
  delete: (id: string): Promise<void> =>
    request<void>(`/users/${id}`, { method: 'DELETE' }),
};

export const developersApi = {
  list: (): Promise<Developer[]> =>
    request<Developer[]>('/developer').then((data) =>
      Array.isArray(data) ? data : ((data as any)?.developers || (data as any)?.data || [])
    ),
  get: (id: string): Promise<Developer> =>
    request<Developer>(`/developer/${id}`),
  create: (payload: CreateDeveloperPayload): Promise<Developer> => {
    return request<Developer>('/developer', { method: 'POST', body: JSON.stringify(payload) });
  },
  update: (id: string, payload: UpdateDeveloperPayload): Promise<Developer> =>
    request<Developer>(`/developer/${id}`, { method: 'PATCH', body: JSON.stringify(payload) }),
  delete: (id: string): Promise<void> =>
    request<void>(`/developer/${id}`, { method: 'DELETE' }),
};

export const projectsApi = {
  list: (): Promise<Project[]> =>
    request<Project[]>('/projects', {}, false).then((data) =>
      Array.isArray(data) ? data : ((data as any)?.projects || (data as any)?.data || [])
    ),
  get: (id: string): Promise<Project> =>
    request<Project>(`/projects/${id}`, {}, false),
  create: (payload: CreateProjectPayload): Promise<Project> => {
    const fd = toFormData(payload as any);
    return request<Project>('/projects', { method: 'POST', body: fd });
  },
  update: (id: string, payload: UpdateProjectPayload): Promise<Project> => {
    const fd = toFormData(payload as any);
    return request<Project>(`/projects/${id}`, { method: 'PATCH', body: fd });
  },
  delete: (id: string): Promise<void> =>
    request<void>(`/projects/${id}`, { method: 'DELETE' }),
};

export const episodesApi = {
  create: (payload: CreateEpisodePayload): Promise<Episode> => {
    const fd = toFormData(payload as any);
    return request<Episode>('/episode', { method: 'POST', body: fd });
  },
  update: (id: string, payload: UpdateEpisodePayload): Promise<Episode> => {
    const fd = toFormData(payload as any);
    return request<Episode>(`/episode/${id}`, { method: 'PATCH', body: fd });
  },
  delete: (id: string): Promise<void> =>
    request<void>(`/episode/${id}`, { method: 'DELETE' }),
};

export const reelsApi = {
  create: (payload: CreateReelPayload): Promise<Reel> => {
    const fd = toFormData(payload as any);
    return request<Reel>('/reels', { method: 'POST', body: fd });
  },
  update: (id: string, payload: UpdateReelPayload): Promise<Reel> => {
    const fd = toFormData(payload as any);
    return request<Reel>(`/reels/${id}`, { method: 'PATCH', body: fd });
  },
  delete: (id: string): Promise<void> =>
    request<void>(`/reels/${id}`, { method: 'DELETE' }),
};

export const inventoryApi = {
  create: (payload: CreateInventoryPayload): Promise<Inventory> => {
    const fd = toFormData(payload as any);
    return request<Inventory>('/files/upload/inventory', { method: 'POST', body: fd });
  },
  update: (id: string, payload: UpdateInventoryPayload): Promise<Inventory> => {
    const fd = toFormData(payload as any);
    return request<Inventory>(`/files/inventory/${id}`, { method: 'PATCH', body: fd });
  },
  delete: (id: string): Promise<void> =>
    request<void>(`/files/inventory/${id}`, { method: 'DELETE' }),
};

export const pdfsApi = {
  create: (payload: CreatePdfPayload): Promise<Pdf> => {
    const fd = toFormData(payload as any);
    return request<Pdf>('/files/upload/pdf', { method: 'POST', body: fd });
  },
  update: (id: string, payload: UpdatePdfPayload): Promise<Pdf> => {
    const fd = toFormData(payload as any);
    return request<Pdf>(`/files/pdf/${id}`, { method: 'PATCH', body: fd });
  },
  delete: (id: string): Promise<void> =>
    request<void>(`/files/pdf/${id}`, { method: 'DELETE' }),
};

export { getFileUrl };