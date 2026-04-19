import { getApiUrl } from './api';

export const setAuthCookies = (accessToken: string, refreshToken: string) => {
    if (typeof window !== 'undefined') {
        document.cookie = `accessToken=${accessToken}; path=/; max-age=${15 * 60}; samesite=Lax`;
        document.cookie = `refreshToken=${refreshToken}; path=/; max-age=${7 * 24 * 60 * 60}; samesite=Lax`;
        // Also set in localStorage for backward compatibility with the existing api.ts
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
    }
};

export const clearAuthCookies = () => {
    if (typeof window !== 'undefined') {
        document.cookie = `accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
        document.cookie = `refreshToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
    }
};

export const getAccessToken = () => {
    if (typeof window === 'undefined') return null;
    const match = document.cookie.match(new RegExp('(^| )accessToken=([^;]+)'));
    if (match) return match[2];
    return localStorage.getItem('accessToken');
};

export const getRefreshToken = () => {
    if (typeof window === 'undefined') return null;
    const match = document.cookie.match(new RegExp('(^| )refreshToken=([^;]+)'));
    if (match) return match[2];
    return localStorage.getItem('refreshToken');
};

export const authApi = {
    register: async (data: any) => {
        const response = await fetch(getApiUrl('/auth/register'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.message || 'Registration failed');
        return result;
    },

    verifyEmail: async (data: { email: string; otp: string }) => {
        const response = await fetch(getApiUrl('/auth/verify-email'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.message || 'Verification failed');
        return result;
    },

    login: async (data: any) => {
        const response = await fetch(getApiUrl('/auth/login'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.message || 'Login failed');
        return result;
    },

    forgotPassword: async (data: { email: string }) => {
        const response = await fetch(getApiUrl('/auth/forgot-password'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.message || 'Failed to send OTP');
        return result;
    },

    verifyResetOtp: async (data: { email: string; otp: string }) => {
        const response = await fetch(getApiUrl('/auth/verify-reset-otp'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.message || 'OTP Verification failed');
        return result;
    },

    resetPassword: async (data: any, resetToken: string) => {
        const response = await fetch(getApiUrl('/auth/reset-password'), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${resetToken}`,
            },
            body: JSON.stringify(data),
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.message || 'Reset password failed');
        return result;
    },

    refreshAuthToken: async () => {
        const refreshToken = getRefreshToken();
        if (!refreshToken) throw new Error('No refresh token available');

        const response = await fetch(getApiUrl('/auth/refresh'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refreshToken }),
        });

        const result = await response.json();
        if (!response.ok) {
            clearAuthCookies();
            throw new Error('Session expired. Please log in again.');
        }

        setAuthCookies(result.accessToken, result.refreshToken);
        return result.accessToken;
    }
};
