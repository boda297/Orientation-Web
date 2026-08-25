// ==========================================
// 📥 Request Payloads
// ==========================================

export interface RegisterPayload {
  username: string;
  email: string;
  password: string;
  phoneNumber?: string;
}

export interface VerifyEmailPayload {
  email: string;
  otp: string;
}

export interface ResendVerificationPayload {
  email: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface VerifyResetOtpPayload {
  email: string;
  otp: string;
}

export interface ResetPasswordPayload {
  email: string;
  newPassword: string;
}

// ==========================================
// 🗄️ Data Interface
// ==========================================

export interface IAuthUser {
  id: string;
  email?: string;
  role?: string;
  username?: string;
}

export type AuthUser = IAuthUser;

// ==========================================
// 📤 API Responses
// ==========================================

export interface RegisterResponse {
  success: boolean;
  message: string;
  email: string;
}

export interface AuthTokensResponse {
  id: string;
  accessToken: string;
  refreshToken: string;
}

export interface StandardApiResponse {
  success?: boolean;
  message?: string;
  accessToken?: string;
  refreshToken?: string;
  resetToken?: string;
}
