import { httpClient } from '../http/httpClient';
import { extractErrorMessage } from '../http/apiError';
import { toFormData } from '../http/formData';
import type {
  Project,
  CreateProjectPayload,
  CreateUpcomingProjectPayload,
  UpdateProjectPayload,
  QueryProjectsParams,
  ProjectActionResponse,
} from '../../types/projects.types';

export * from '../../types/projects.types';

/**
 * Get all projects with optional filters, pagination, and sorting
 */
export async function getProjects(params?: QueryProjectsParams): Promise<Project[]> {
  try {
    const response = await httpClient.get<Project[]>('/projects', {
      params,
      cacheTTL: 60 * 60 * 1000, // 60 minutes (1 hour)
    });
    return Array.isArray(response.data) ? response.data : ((response.data as any)?.projects || (response.data as any)?.data || []);
  } catch (error) {
    throw new Error(extractErrorMessage(error, 'Failed to fetch projects'));
  }
}

/**
 * Get single project by ID with populated references
 */
export async function getProjectById(id: string): Promise<Project> {
  try {
    const response = await httpClient.get<Project>(`/projects/${id}`, {
      cacheTTL: 30 * 60 * 1000, // 30 minutes
    });
    return response.data;
  } catch (error) {
    throw new Error(extractErrorMessage(error, 'Failed to fetch project'));
  }
}

/**
 * Get featured projects
 */
export async function getFeaturedProjects(limit: number = 3): Promise<Project[]> {
  try {
    const response = await httpClient.get<Project[]>('/projects/featured', {
      params: { limit },
      cacheTTL: 2 * 60 * 60 * 1000, // 2 hours — featured changes very rarely
    });
    return Array.isArray(response.data) ? response.data : ((response.data as any)?.projects || []);
  } catch (error) {
    throw new Error(extractErrorMessage(error, 'Failed to fetch featured projects'));
  }
}

/**
 * Get latest projects
 */
export async function getLatestProjects(limit: number = 10): Promise<Project[]> {
  try {
    const response = await httpClient.get<Project[]>('/projects/latest', {
      params: { limit },
      cacheTTL: 60 * 60 * 1000, // 60 minutes
    });
    return Array.isArray(response.data) ? response.data : ((response.data as any)?.projects || []);
  } catch (error) {
    throw new Error(extractErrorMessage(error, 'Failed to fetch latest projects'));
  }
}

/**
 * Get upcoming projects (status: 'PLANNING')
 */
export async function getUpcomingProjects(limit: number = 10): Promise<Project[]> {
  try {
    const response = await httpClient.get<Project[]>('/projects/upcoming', {
      params: { limit },
      cacheTTL: 2 * 60 * 60 * 1000, // 2 hours — upcoming projects rarely change
    });
    return Array.isArray(response.data) ? response.data : ((response.data as any)?.projects || []);
  } catch (error) {
    throw new Error(extractErrorMessage(error, 'Failed to fetch upcoming projects'));
  }
}

/**
 * Get top 10 trending projects
 */
export async function getTop10Projects(limit: number = 10): Promise<Project[]> {
  try {
    const response = await httpClient.get<Project[]>('/projects/top10', {
      params: { limit },
      cacheTTL: 60 * 60 * 1000, // 60 minutes
    });
    return Array.isArray(response.data) ? response.data : ((response.data as any)?.projects || []);
  } catch (error) {
    throw new Error(extractErrorMessage(error, 'Failed to fetch top projects'));
  }
}

/**
 * Search projects by location
 */
export async function getProjectsByLocation(location: string, limit: number = 10): Promise<Project[]> {
  try {
    const response = await httpClient.get<Project[]>('/projects/location', {
      params: { location, limit },
      cacheTTL: 10 * 60 * 1000, // 10 minutes
    });
    return Array.isArray(response.data) ? response.data : ((response.data as any)?.projects || []);
  } catch (error) {
    throw new Error(extractErrorMessage(error, 'Failed to fetch projects by location'));
  }
}

/**
 * Get projects by developer ID
 */
export async function getProjectsByDeveloper(developerId: string): Promise<Project[]> {
  try {
    const response = await httpClient.get<Project[]>('/projects/developer', {
      params: { developer: developerId },
    });
    return Array.isArray(response.data) ? response.data : ((response.data as any)?.projects || []);
  } catch (error) {
    throw new Error(extractErrorMessage(error, 'Failed to fetch developer projects'));
  }
}

/**
 * Get projects by status
 */
export async function getProjectsByStatus(status: string): Promise<Project[]> {
  try {
    const response = await httpClient.get<Project[]>('/projects/status', {
      params: { status },
    });
    return Array.isArray(response.data) ? response.data : ((response.data as any)?.projects || []);
  } catch (error) {
    throw new Error(extractErrorMessage(error, 'Failed to fetch projects by status'));
  }
}

/**
 * Get project by exact title match
 */
export async function getProjectByTitle(title: string): Promise<Project> {
  try {
    const response = await httpClient.get<Project>('/projects/title', {
      params: { title },
    });
    return response.data;
  } catch (error) {
    throw new Error(extractErrorMessage(error, 'Failed to fetch project by title'));
  }
}

/**
 * Create a new project (multipart/form-data)
 */
export async function createProject(payload: CreateProjectPayload | FormData): Promise<ProjectActionResponse> {
  try {
    const data = toFormData(payload as any);
    const response = await httpClient.post<ProjectActionResponse>('/projects', data);
    return response.data;
  } catch (error) {
    throw new Error(extractErrorMessage(error, 'Failed to create project'));
  }
}

/**
 * Create an upcoming project (status: 'PLANNING')
 */
export async function createUpcomingProject(payload: CreateUpcomingProjectPayload | FormData): Promise<ProjectActionResponse> {
  try {
    const data = toFormData(payload as any);
    const response = await httpClient.post<ProjectActionResponse>('/projects/upcomming', data);
    return response.data;
  } catch (error) {
    throw new Error(extractErrorMessage(error, 'Failed to create upcoming project'));
  }
}

/**
 * Update a project by ID
 */
export async function updateProject(id: string, payload: UpdateProjectPayload | FormData): Promise<ProjectActionResponse> {
  try {
    const data = toFormData(payload as any);
    const response = await httpClient.patch<ProjectActionResponse>(`/projects/${id}`, data);
    return response.data;
  } catch (error) {
    throw new Error(extractErrorMessage(error, 'Failed to update project'));
  }
}

/**
 * Delete a project by ID
 */
export async function deleteProject(id: string): Promise<ProjectActionResponse> {
  try {
    const response = await httpClient.delete<ProjectActionResponse>(`/projects/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(extractErrorMessage(error, 'Failed to delete project'));
  }
}

/**
 * Save project to user's bookmarks
 */
export async function saveProject(id: string): Promise<ProjectActionResponse> {
  try {
    const response = await httpClient.patch<ProjectActionResponse>(`/projects/${id}/save-project`);
    return response.data;
  } catch (error) {
    throw new Error(extractErrorMessage(error, 'Failed to save project'));
  }
}

/**
 * Remove project from user's bookmarks
 */
export async function unsaveProject(id: string): Promise<ProjectActionResponse> {
  try {
    const response = await httpClient.patch<ProjectActionResponse>(`/projects/${id}/unsave-project`);
    return response.data;
  } catch (error) {
    throw new Error(extractErrorMessage(error, 'Failed to unsave project'));
  }
}

/**
 * Publish a project
 */
export async function publishProject(id: string): Promise<ProjectActionResponse> {
  try {
    const response = await httpClient.put<ProjectActionResponse>(`/projects/${id}/publish`);
    return response.data;
  } catch (error) {
    throw new Error(extractErrorMessage(error, 'Failed to publish project'));
  }
}

/**
 * Unpublish a project
 */
export async function unpublishProject(id: string): Promise<ProjectActionResponse> {
  try {
    const response = await httpClient.put<ProjectActionResponse>(`/projects/${id}/unpublish`);
    return response.data;
  } catch (error) {
    throw new Error(extractErrorMessage(error, 'Failed to unpublish project'));
  }
}

/** Grouped project service */
export const projectsApi = {
  list: getProjects,
  get: getProjectById,
  getFeatured: getFeaturedProjects,
  getLatest: getLatestProjects,
  getUpcoming: getUpcomingProjects,
  getTop10: getTop10Projects,
  getByLocation: getProjectsByLocation,
  getByDeveloper: getProjectsByDeveloper,
  getByStatus: getProjectsByStatus,
  getByTitle: getProjectByTitle,
  create: createProject,
  createUpcoming: createUpcomingProject,
  update: updateProject,
  delete: deleteProject,
  save: saveProject,
  unsave: unsaveProject,
  publish: publishProject,
  unpublish: unpublishProject,
};
