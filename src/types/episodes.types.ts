// ==========================================
// 📥 Request Payloads
// ==========================================

export interface CreateEpisodePayload {
  projectId: string;
  title: string;
  episodeOrder: string | number;
  duration: string | number;
  file: File;
  thumbnail?: File | null;
}

export interface UpdateEpisodePayload {
  title?: string;
  episodeOrder?: number;
  duration?: number;
  episodeFile?: File | null;
  thumbnail?: File | null;
}

// ==========================================
// 🗄️ Data Interface
// ==========================================

export interface IEpisode {
  _id: string;
  projectId: string;
  title: string;
  thumbnail?: string;
  episodeUrl: string;
  episodeOrder: string | number;
  duration?: string | number;
  locked?: boolean;
}

export type Episode = IEpisode;

// ==========================================
// 📤 API Responses
// ==========================================

export interface EpisodeActionResponse {
  message: string;
  episode?: IEpisode;
}
