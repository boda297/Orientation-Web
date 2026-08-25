// ==========================================
// 📥 Request Payloads
// ==========================================

export type UploadFolder = 'episodes' | 'reels' | 'images' | 'PDF';

// ==========================================
// 🗄️ Data Interface
// ==========================================

export interface IUploadData {
  key: string;
  url: string;
}

export type UploadData = IUploadData;

// ==========================================
// 📤 API Responses
// ==========================================

export interface UploadResponse {
  success: boolean;
  message: string;
  data: IUploadData;
}
