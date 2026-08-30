import type { IDeveloper } from "./developer.types";
import type { IEpisode } from "./episodes.types";
import type { IReel } from "./reels.types";
import type { IInventory, IPdf } from "./files.types";

// ==========================================
// 📥 Request Payloads
// ==========================================

export interface CreateProjectPayload {
  title: string;
  developer: string;
  location: string;
  status?: ProjectStatus;
  script: string;
  episodes?: any;
  reels?: any;
  inventory?: string;
  pdf?: string[];
  whatsappNumber?: string;
  featured?: boolean;
  mapsLocation?: string;
  logo?: File | null;
  heroVideo?: File | null;
  projectThumbnail?: File | null;
}

export interface CreateUpcomingProjectPayload {
  title: string;
  developer: string;
  location: string;
  projectThumbnail: File;
}

export interface UpdateProjectPayload {
  title?: string;
  developer?: string;
  location?: string;
  status?: ProjectStatus;
  script?: string;
  featured?: boolean;
  mapsLocation?: string;
  whatsappNumber?: string;
  inventory?: string;
  pdf?: string[];
  published?: boolean;
  logo?: File | null;
  heroVideo?: File | null;
  projectThumbnail?: File | null;
}

export interface QueryProjectsParams {
  developerId?: string;
  location?: string;
  status?: string;
  title?: string;
  slug?: string;
  limit?: number;
  page?: number;
  sortBy?: "newest" | "trending" | "saveCount" | "viewCount" | string;
}

// ==========================================
// 🗄️ Data Interface
// ==========================================

export type ProjectStatus =
  | "PLANNING"
  | "CONSTRUCTION"
  | "COMPLETED"
  | "DELIVERED"
  | string;

export interface ProjectDeveloperRef {
  _id: string;
  name: string;
  logoUrl?: string;
  logo?: string;
}

export interface ProjectEpisode {
  _id: string;
  title: string;
  episodeOrder?: number | string;
  duration?: string | number;
  thumbnail?: string;
  episodeUrl?: string;
  locked?: boolean;
}

export interface ProjectReel {
  _id: string;
  title: string;
  thumbnail?: string;
  reelUrl?: string;
  likes?: number;
  number?: number;
  locked?: boolean;
}

export interface ProjectInventory {
  _id: string;
  title: string;
  inventoryUrl?: string;
  fileUrl?: string;
  locked?: boolean;
}

export interface ProjectPdf {
  _id: string;
  title: string;
  pdfUrl?: string;
  fileUrl?: string;
  size?: string;
  locked?: boolean;
}

export interface IProject {
  _id: string;
  title: string;
  slug?: string;
  logoUrl?: string;
  location: string;
  status: ProjectStatus;
  developer:
    | string
    | {
        _id: string;
        name: string;
        logoUrl?: string;
      }
    | IDeveloper;
  script: string;
  episodes?: Array<IEpisode>;
  reels?: Array<IReel>;
  inventory?: Array<IInventory>;
  pdf?: Array<IPdf>;
  projectThumbnailUrl: string;
  heroVideoUrl: string;
  whatsappNumber?: string;
  mapsLocation?: string;
  trendingScore?: number;
  saveCount?: number;
  viewCount?: number;
  rank?: number;
  featured?: boolean;
  published?: boolean;
  adUrl?: string;
  hasAccess?: boolean;
}

export type Project = IProject;

// ==========================================
// 📤 API Responses
// ==========================================

export interface ProjectActionResponse {
  message: string;
  project?: IProject | string;
}
