import { apiClient } from '@/shared/api/client';

import type {
  CreateFocusSessionPayload,
  FocusSession,
  FocusSettings,
  UpdateFocusSettingsPayload,
} from '../domain/focus.types';

export const focusService = {
  getSettings: async (): Promise<FocusSettings> => {
    const response = await apiClient.get<FocusSettings>('/focus/settings');
    return response.data;
  },

  updateSettings: async (payload: UpdateFocusSettingsPayload): Promise<FocusSettings> => {
    const response = await apiClient.patch<FocusSettings>('/focus/settings', payload);
    return response.data;
  },

  createSession: async (payload: CreateFocusSessionPayload): Promise<FocusSession> => {
    const response = await apiClient.post<FocusSession>('/focus/session', payload);
    return response.data;
  },
};
