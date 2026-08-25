import { AxiosError } from 'axios';

/**
 * Extracts a human-readable error message from an Axios backend error response.
 * Handles string messages, NestJS validation error arrays, error/detail fields,
 * and falls back to a default fallback string.
 */
export function extractErrorMessage(error: unknown, fallback: string): string {
    if (error instanceof AxiosError && error.response?.data) {
        const data = error.response.data as Record<string, unknown> | string;

        if (typeof data === 'string' && data.trim()) {
            return data;
        }

        if (typeof data === 'object' && data !== null) {
            // Handles NestJS class-validator arrays: { message: ["...", "..."] }
            if (Array.isArray(data.message)) {
                return data.message.join(', ');
            }
            // Standard NestJS response object: { message: "..." }
            if (typeof data.message === 'string' && data.message.trim()) {
                return data.message;
            }
            // Alternative error field: { error: "..." }
            if (typeof data.error === 'string' && data.error.trim()) {
                return data.error;
            }
            // Python/FastAPI/Django style detail field: { detail: "..." }
            if (typeof data.detail === 'string' && data.detail.trim()) {
                return data.detail;
            }
        }
    }

    if (error instanceof Error && error.message) {
        return error.message;
    }

    return fallback;
}