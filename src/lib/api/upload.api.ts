import { httpClient } from '../http/httpClient';
import { extractErrorMessage } from '../http/apiError';
import type { UploadFolder, UploadResponse } from '../../types/upload.types';

export * from '../../types/upload.types';

/**
 * Upload a generic file to S3
 */
export async function uploadFile(
  file: File,
  folder?: UploadFolder
): Promise<UploadResponse> {
  try {
    const formData = new FormData();
    formData.append('file', file);
    if (folder) {
      formData.append('folder', folder);
    }
    const response = await httpClient.post<UploadResponse>('/upload', formData);
    return response.data;
  } catch (error) {
    throw new Error(extractErrorMessage(error, 'Failed to upload file'));
  }
}

/**
 * Upload episode video file (up to 500MB)
 */
export async function uploadEpisode(file: File): Promise<UploadResponse> {
  try {
    const formData = new FormData();
    formData.append('file', file);
    const response = await httpClient.post<UploadResponse>('/upload/episode', formData);
    return response.data;
  } catch (error) {
    throw new Error(extractErrorMessage(error, 'Failed to upload episode file'));
  }
}

/**
 * Upload reel video file (up to 100MB)
 */
export async function uploadReel(file: File): Promise<UploadResponse> {
  try {
    const formData = new FormData();
    formData.append('file', file);
    const response = await httpClient.post<UploadResponse>('/upload/reel', formData);
    return response.data;
  } catch (error) {
    throw new Error(extractErrorMessage(error, 'Failed to upload reel video'));
  }
}

/**
 * Upload image file (up to 10MB)
 */
export async function uploadImage(file: File): Promise<UploadResponse> {
  try {
    const formData = new FormData();
    formData.append('file', file);
    const response = await httpClient.post<UploadResponse>('/upload/image', formData);
    return response.data;
  } catch (error) {
    throw new Error(extractErrorMessage(error, 'Failed to upload image'));
  }
}

/**
 * Upload PDF file (up to 20MB)
 */
export async function uploadPdf(file: File): Promise<UploadResponse> {
  try {
    const formData = new FormData();
    formData.append('file', file);
    const response = await httpClient.post<UploadResponse>('/upload/pdf', formData);
    return response.data;
  } catch (error) {
    throw new Error(extractErrorMessage(error, 'Failed to upload PDF'));
  }
}

/** Grouped upload service */
export const uploadApi = {
  uploadFile,
  uploadEpisode,
  uploadReel,
  uploadImage,
  uploadPdf,
};
