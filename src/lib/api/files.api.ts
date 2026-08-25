import { httpClient } from '../http/httpClient';
import { extractErrorMessage } from '../http/apiError';
import { toFormData } from '../http/formData';
import type {
  Inventory,
  PdfFile,
  CreateInventoryPayload,
  UpdateInventoryPayload,
  CreatePdfPayload,
  UpdatePdfPayload,
  InventoryActionResponse,
  PdfActionResponse,
} from '../../types/files.types';

export * from '../../types/files.types';

/**
 * Get all inventory files
 */
export async function getInventoryFiles(): Promise<Inventory[]> {
  try {
    const response = await httpClient.get<Inventory[]>('/files/inventory');
    return Array.isArray(response.data) ? response.data : ((response.data as any)?.inventory || []);
  } catch (error) {
    throw new Error(extractErrorMessage(error, 'Failed to fetch inventory files'));
  }
}

/**
 * Get inventory file by ID
 */
export async function getInventoryFileById(id: string): Promise<Inventory> {
  try {
    const response = await httpClient.get<Inventory>(`/files/inventory/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(extractErrorMessage(error, 'Failed to fetch inventory file'));
  }
}

/**
 * Upload an inventory file
 */
export async function createInventory(
  payload: CreateInventoryPayload | FormData
): Promise<{ message: string; inventory: Inventory }> {
  try {
    const data = toFormData(payload as any);
    const response = await httpClient.post<{ message: string; inventory: Inventory }>(
      '/files/upload/inventory',
      data
    );
    return response.data;
  } catch (error) {
    throw new Error(extractErrorMessage(error, 'Failed to upload inventory file'));
  }
}

/**
 * Update an inventory file
 */
export async function updateInventory(
  id: string,
  payload: UpdateInventoryPayload | FormData
): Promise<{ message: string; inventory: Inventory }> {
  try {
    const data = toFormData(payload as any);
    const response = await httpClient.patch<{ message: string; inventory: Inventory }>(
      `/files/inventory/${id}`,
      data
    );
    return response.data;
  } catch (error) {
    throw new Error(extractErrorMessage(error, 'Failed to update inventory file'));
  }
}

/**
 * Delete an inventory file
 */
export async function deleteInventory(id: string): Promise<{ message: string }> {
  try {
    const response = await httpClient.delete<{ message: string }>(`/files/inventory/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(extractErrorMessage(error, 'Failed to delete inventory file'));
  }
}

/**
 * Get all PDF files
 */
export async function getPdfFiles(): Promise<PdfFile[]> {
  try {
    const response = await httpClient.get<PdfFile[]>('/files/pdf');
    return Array.isArray(response.data) ? response.data : ((response.data as any)?.pdf || (response.data as any)?.files || []);
  } catch (error) {
    throw new Error(extractErrorMessage(error, 'Failed to fetch PDF files'));
  }
}

/**
 * Get PDF file by ID
 */
export async function getPdfFileById(id: string): Promise<PdfFile> {
  try {
    const response = await httpClient.get<PdfFile>(`/files/pdf/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(extractErrorMessage(error, 'Failed to fetch PDF file'));
  }
}

/**
 * Upload a PDF file
 */
export async function createPdf(
  payload: CreatePdfPayload | FormData
): Promise<{ message: string; pdf: PdfFile }> {
  try {
    const data = toFormData(payload as any);
    const response = await httpClient.post<{ message: string; pdf: PdfFile }>(
      '/files/upload/pdf',
      data
    );
    return response.data;
  } catch (error) {
    throw new Error(extractErrorMessage(error, 'Failed to upload PDF file'));
  }
}

/**
 * Update a PDF file
 */
export async function updatePdf(
  id: string,
  payload: UpdatePdfPayload | FormData
): Promise<{ message: string; pdf: PdfFile }> {
  try {
    const data = toFormData(payload as any);
    const response = await httpClient.patch<{ message: string; pdf: PdfFile }>(
      `/files/pdf/${id}`,
      data
    );
    return response.data;
  } catch (error) {
    throw new Error(extractErrorMessage(error, 'Failed to update PDF file'));
  }
}

/**
 * Delete a PDF file
 */
export async function deletePdf(id: string): Promise<{ message: string }> {
  try {
    const response = await httpClient.delete<{ message: string }>(`/files/pdf/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(extractErrorMessage(error, 'Failed to delete PDF file'));
  }
}

/** Grouped inventory service */
export const inventoryApi = {
  list: getInventoryFiles,
  get: getInventoryFileById,
  create: createInventory,
  update: updateInventory,
  delete: deleteInventory,
};

/** Grouped pdf service */
export const pdfsApi = {
  list: getPdfFiles,
  get: getPdfFileById,
  create: createPdf,
  update: updatePdf,
  delete: deletePdf,
};

/** Grouped files service */
export const filesApi = {
  inventory: inventoryApi,
  pdf: pdfsApi,
};
