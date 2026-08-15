const API_BASE_URL = "https://api.orientationapps.com";

// Helper function to build full URL
export const getApiUrl = (endpoint: string) => {
  return `${API_BASE_URL}${endpoint}`;
};

// Helper function to get file URL (if it's a relative path, prepend base URL)
export const getFileUrl = (url: string | undefined | null): string => {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }
  return `${API_BASE_URL}${url.startsWith("/") ? url : `/${url}`}`;
};

// API Functions
export const api = {
  // Get continue watching history
  getContinueWatching: async (limit: number = 10) => {
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("accessToken")
        : null;
    if (!token) {
      return { items: [] };
    }
    const response = await fetch(
      getApiUrl(`/watch-history/continue-watching?limit=${limit}`),
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );
    if (!response.ok) {
      if (response.status === 401) {
        return { items: [] };
      }
      throw new Error(`Failed to fetch watch history: ${response.statusText}`);
    }
    return response.json();
  },
  // Get project by ID
  getProject: async (id: string) => {
    try {
      const response = await fetch(getApiUrl(`/projects/${id}`));
      if (!response.ok) {
        // Try to get error message from response
        let errorMessage = `Failed to fetch project: ${response.status} ${response.statusText}`;
        try {
          const errorData = await response.json();
          if (errorData.message) {
            errorMessage = errorData.message;
          } else if (errorData.error) {
            errorMessage = errorData.error;
          }
        } catch (e) {
          // If response is not JSON, use default message
        }
        throw new Error(errorMessage);
      }
      const data = await response.json();
      return data;
    } catch (error: any) {
      console.error("API Error in getProject:", error);
      throw error; // Re-throw the error with the original message
    }
  },

  // Get episodes for a project (from project object or separate endpoint)
  getEpisodes: async () => {
    const response = await fetch(getApiUrl("/episode"));
    if (!response.ok) {
      throw new Error(`Failed to fetch episodes: ${response.statusText}`);
    }
    return response.json();
  },

  // Get inventory files
  getInventory: async () => {
    const response = await fetch(getApiUrl("/files/inventory"));
    if (!response.ok) {
      throw new Error(`Failed to fetch inventory: ${response.statusText}`);
    }
    return response.json();
  },

  // Get PDF files
  getPdfs: async () => {
    const response = await fetch(getApiUrl("/files/pdf"));
    if (!response.ok) {
      throw new Error(`Failed to fetch PDFs: ${response.statusText}`);
    }
    return response.json();
  },

  // Get featured projects
  getFeaturedProjects: async (limit: number = 10) => {
    const response = await fetch(
      getApiUrl(`/projects/featured?limit=${limit}`),
    );
    if (!response.ok) {
      throw new Error(
        `Failed to fetch featured projects: ${response.statusText}`,
      );
    }
    return response.json();
  },

  // Get projects by location
  getProjectsByLocation: async (location: string) => {
    const response = await fetch(
      getApiUrl(`/projects/location?location=${encodeURIComponent(location)}`),
    );
    if (!response.ok) {
      throw new Error(
        `Failed to fetch projects by location: ${response.statusText}`,
      );
    }
    return response.json();
  },

  // Get all projects with filters
  getProjects: async (params?: {
    developerId?: string;
    location?: string;
    status?: string;
    title?: string;
    slug?: string;
    limit?: number;
    page?: number;
    sortBy?: "newest" | "trending" | "saveCount" | "viewCount";
  }) => {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, String(value));
        }
      });
    }
    const url = getApiUrl(
      `/projects${queryParams.toString() ? `?${queryParams.toString()}` : ""}`,
    );
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch projects: ${response.statusText}`);
    }
    return response.json();
  },

  // Get trending projects
  getTrendingProjects: async (limit: number = 10) => {
    const response = await fetch(
      getApiUrl(`/projects/trending?limit=${limit}`),
    );
    if (!response.ok) {
      throw new Error(
        `Failed to fetch trending projects: ${response.statusText}`,
      );
    }
    return response.json();
  },

  // Get latest projects
  getLatestProjects: async (limit: number = 10) => {
    const response = await fetch(getApiUrl(`/projects/latest?limit=${limit}`));
    if (!response.ok) {
      throw new Error(`Failed to fetch latest projects: ${response.statusText}`);
    }
    return response.json();
  },

  // Get projects by status
  getProjectsByStatus: async (status: string) => {
    const response = await fetch(
      getApiUrl(`/projects/status?status=${encodeURIComponent(status)}`),
    );
    if (!response.ok) {
      throw new Error(
        `Failed to fetch projects by status: ${response.statusText}`,
      );
    }
    return response.json();
  },

  // Get all news
  getNews: async () => {
    const response = await fetch(getApiUrl("/news"));
    if (!response.ok) {
      throw new Error(`Failed to fetch news: ${response.statusText}`);
    }
    return response.json();
  },
};
