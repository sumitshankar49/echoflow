import { apiClient } from '@/shared/api';
import type { AuthTokens, LoginPayload, RegisterPayload } from '../domain/auth.types';

export const authService = {
  login: (payload: LoginPayload) =>
    apiClient.post<AuthTokens>('/auth/login', payload).then((r) => r.data),

  register: (payload: RegisterPayload) =>
    apiClient.post<AuthTokens>('/auth/register', payload).then((r) => r.data),

  refresh: (refreshToken: string) =>
    apiClient.post<AuthTokens>('/auth/refresh', { refreshToken }).then((r) => r.data),

  logout: () => apiClient.post('/auth/logout').then((r) => r.data),
};
