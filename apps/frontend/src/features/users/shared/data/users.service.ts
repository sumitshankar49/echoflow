import { apiClient } from '@/shared/api/client';
import type {
  ChangePasswordPayload,
  MessageResponse,
  UpdateProfilePayload,
  UserProfile,
} from '../domain/users.types';

export const usersService = {
  getMe: () => apiClient.get<UserProfile>('/users/me').then((response) => response.data),

  updateMe: (payload: UpdateProfilePayload) =>
    apiClient.patch<UserProfile>('/users/me', payload).then((response) => response.data),

  changePassword: (payload: ChangePasswordPayload) =>
    apiClient
      .patch<MessageResponse>('/users/me/password', payload)
      .then((response) => response.data),
};