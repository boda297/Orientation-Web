// ==========================================
// 📥 Request Payloads
// ==========================================

export interface CreateNewsPayload {
  title: string;
  projectId: string;
  developer: string;
  image: File;
}

export interface UpdateNewsPayload {
  title?: string;
  projectId?: string;
  developer?: string;
  image?: File | null;
}

// ==========================================
// 🗄️ Data Interface
// ==========================================

export interface INews {
  _id: string;
  title: string;
  thumbnail: string;
  projectId: string;
  developer: string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export type News = INews;

// ==========================================
// 📤 API Responses
// ==========================================

export interface NewsActionResponse {
  message: string;
  news?: INews;
}
