export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  inviteCircleId?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  gender?: string | null;
  dob?: string | null;
  mobileNumber?: string | null;
  relationshipStatus?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface ResetPasswordPayload {
  email: string;
  otp: string;
  newPassword: string;
  confirmPassword: string;
}

export interface MessageResponse {
  message: string;
}
