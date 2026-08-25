// ==========================================
// 📥 Request Payloads
// ==========================================

export interface CreateInventoryPayload {
  projectId: string;
  title: string;
  inventory: File;
}

export interface UpdateInventoryPayload {
  title?: string;
  inventory?: File | null;
}

export interface CreatePdfPayload {
  projectId: string;
  title: string;
  PDF: File;
}

export interface UpdatePdfPayload {
  title?: string;
  PDF?: File | null;
}

// ==========================================
// 🗄️ Data Interface
// ==========================================

export interface IInventory {
  _id: string;
  projectId: string;
  fileUrl: string;
  fileName?: string;
  s3Key?: string;
  title?: string;
  description?: string;
}

export type Inventory = IInventory;

export interface IPdf {
  _id: string;
  projectId: string;
  pdfUrl?: string;
  fileUrl?: string;
  fileName?: string;
  title: string;
  s3Key?: string;
  size?: string;
}

export type IPdfFile = IPdf;
export type PdfFile = IPdf;

// ==========================================
// 📤 API Responses
// ==========================================

export interface InventoryActionResponse {
  message: string;
  inventory?: IInventory;
}

export interface PdfActionResponse {
  message: string;
  pdf?: IPdf;
}
