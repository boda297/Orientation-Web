// ==========================================
// 📥 Request Payloads
// ==========================================

export interface UpdateWatchProgressPayload {
  projectId?: string;
  projectTitle?: string;
  contentId: string;
  contentTitle: string;
  contentThumbnail?: string;
  episodeUrl?: string;
  currentTime: number;
  duration: number;
  contentType?: string;
  season?: number;
  episode?: number;
}

// ==========================================
// 🗄️ Data Interface
// ==========================================

export interface IWatchHistoryItem {
  _id: string;
  userId: string;
  contentId: string;
  contentTitle: string;
  contentThumbnail?: string;
  currentTime: number;
  duration: number;
  progressPercentage: number;
  completed: boolean;
  lastWatchedAt: Date | string;
  contentType?: 'movie' | 'series' | 'episode' | string;
  season?: number;
  episode?: number;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export type WatchHistoryItem = IWatchHistoryItem;

// ==========================================
// 📤 API Responses
// ==========================================

export interface WatchHistoryResponse {
  message: string;
  items: IWatchHistoryItem[];
  count: number;
}

export interface SingleWatchHistoryResponse {
  message: string;
  watchHistory: IWatchHistoryItem | null;
}
