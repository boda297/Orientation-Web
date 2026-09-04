import { httpClient } from "../http/httpClient";
import { extractErrorMessage } from "../http/apiError";
import { tokenStorage } from "../http/tokenStorage";
import { getApiUrl } from "../http/url";
import type {
  RegisterPayload,
  RegisterResponse,
  VerifyEmailPayload,
  ResendVerificationPayload,
  LoginPayload,
  AuthTokensResponse,
  StandardApiResponse,
  ForgotPasswordPayload,
  VerifyResetOtpPayload,
  ResetPasswordPayload,
} from "../../types/auth.types";
export * from "../../types/auth.types";

// Register
export async function register(
  payload: RegisterPayload,
): Promise<RegisterResponse> {
  try {
    const response = await httpClient.post<RegisterResponse>(
      "/auth/register",
      payload,
      { skipAuthRefresh: true },
    );
    return response.data;
  } catch (error) {
    throw new Error(extractErrorMessage(error, "Registration failed"));
  }
}

// Verify Email OTP
export async function verifyEmail(
  payload: VerifyEmailPayload,
): Promise<StandardApiResponse> {
  try {
    const response = await httpClient.post<StandardApiResponse>(
      "/auth/verify-email",
      payload,
      { skipAuthRefresh: true },
    );
    return response.data;
  } catch (error) {
    throw new Error(extractErrorMessage(error, "Verification failed"));
  }
}

// Resend Verification OTP
export async function resendVerification(
  payload: ResendVerificationPayload,
): Promise<StandardApiResponse> {
  try {
    const response = await httpClient.post<StandardApiResponse>(
      "/auth/resend-verification",
      payload,
      { skipAuthRefresh: true },
    );
    return response.data;
  } catch (error) {
    throw new Error(
      extractErrorMessage(error, "Failed to resend verification code"),
    );
  }
}

// Login
export async function login(
  payload: LoginPayload,
): Promise<AuthTokensResponse> {
  try {
    const response = await httpClient.post<any>(
      "/auth/login",
      payload,
      { skipAuthRefresh: true },
    );
    const data = response.data?.data || response.data;
    const accessToken = data?.accessToken || data?.token || response.data?.accessToken || response.data?.token;
    const refreshToken = data?.refreshToken || response.data?.refreshToken || accessToken;
    
    if (accessToken) {
      tokenStorage.setTokens(
        accessToken,
        refreshToken || accessToken,
      );
    }
    return data || response.data;
  } catch (error) {
    throw new Error(extractErrorMessage(error, "Login failed"));
  }
}

// 🌐 Google Web OAuth Login — Redirects to /auth/google/login
export function getGoogleLoginUrl(): string {
  return getApiUrl("/auth/google/login");
}

export function loginWithGoogle(): void {
  if (typeof window !== "undefined") {
    window.location.href = getGoogleLoginUrl();
  }
}

// 🌐 Apple Web OAuth Login — Redirects to /auth/apple/login
export function getAppleLoginUrl(): string {
  return getApiUrl("/auth/apple/login");
}

export function loginWithApple(): void {
  if (typeof window !== "undefined") {
    window.location.href = getAppleLoginUrl();
  }
}

// Sign Out
export async function signOut(): Promise<StandardApiResponse> {
  try {
    const response =
      await httpClient.post<StandardApiResponse>("/auth/signout");
    return response.data;
  } catch (error) {
    throw new Error(extractErrorMessage(error, "Failed to sign out"));
  } finally {
    tokenStorage.clear();
  }
}

// Logout
export const logout = signOut;

// Forgot Password
export async function forgotPassword(
  payload: ForgotPasswordPayload,
): Promise<StandardApiResponse> {
  try {
    const response = await httpClient.post<StandardApiResponse>(
      "/auth/forgot-password",
      payload,
      { skipAuthRefresh: true },
    );
    return response.data;
  } catch (error) {
    throw new Error(extractErrorMessage(error, "Failed to send reset code"));
  }
}

// Verify Reset OTP
export async function verifyResetOtp(
  payload: VerifyResetOtpPayload,
): Promise<StandardApiResponse> {
  try {
    const response = await httpClient.post<StandardApiResponse>(
      "/auth/verify-reset-otp",
      payload,
      { skipAuthRefresh: true },
    );
    return response.data;
  } catch (error) {
    throw new Error(extractErrorMessage(error, "OTP verification failed"));
  }
}

// Reset Password
export async function resetPassword(
  payload: ResetPasswordPayload,
): Promise<StandardApiResponse> {
  try {
    const response = await httpClient.post<StandardApiResponse>(
      "/auth/reset-password",
      payload,
      { skipAuthRefresh: true },
    );
    return response.data;
  } catch (error) {
    throw new Error(extractErrorMessage(error, "Failed to reset password"));
  }
}

// Refresh Token
export async function refreshAuthToken(): Promise<string> {
  try {
    const response = await httpClient.post<AuthTokensResponse>(
      "/auth/refresh",
      {},
      { skipAuthRefresh: true },
    );
    if (response.data?.accessToken && response.data?.refreshToken) {
      tokenStorage.setTokens(
        response.data.accessToken,
        response.data.refreshToken,
      );
    }
    return response.data?.accessToken || "";
  } catch (error) {
    tokenStorage.clear();
    throw new Error(extractErrorMessage(error, "Session expired"));
  }
}

/** Grouped auth service */
export const authApi = {
  register,
  verifyEmail,
  resendVerification,
  login,
  loginWithGoogle,
  getGoogleLoginUrl,
  loginWithApple,
  getAppleLoginUrl,
  signOut,
  logout,
  forgotPassword,
  verifyResetOtp,
  resetPassword,
  refreshToken: refreshAuthToken,
};
