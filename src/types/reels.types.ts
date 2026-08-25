// ==========================================
// 📥 Request Payloads
// ==========================================

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

// ==========================================
// 🗄️ Data Interface
// ==========================================

export interface IReel {
  _id: string;
  title: string;
  videoUrl?: string;
  thumbnail?: string;
  thumbnailUrl?: string;
  fileUrl?: string;
  projectId?: string;
  developerId?: string;
  viewCount?: number;
  saveCount?: number;
  likes?: number;
  order?: number;
  number?: number;
}

export type Reel = IReel;

// ==========================================
// 📤 API Responses
// ==========================================

export interface ReelActionResponse {
  message: string;
  reel?: IReel;
}

export interface SavedReelsResponse {
  message: string;
  reels: IReel[];
}
