import { apiClient } from '@/shared/api/client';

import type {
  CheckInPayload,
  CreateHabitPayload,
  HabitLog,
  HabitWithStats,
  UpdateHabitPayload,
} from '../domain/habits.types';

export const habitsService = {
  list: async (): Promise<HabitWithStats[]> => {
    const res = await apiClient.get<HabitWithStats[]>('/habits');
    return res.data;
  },

  getLogs: async (habitId: string): Promise<HabitLog[]> => {
    const res = await apiClient.get<HabitLog[]>(`/habits/${habitId}/logs`);
    return res.data;
  },

  create: async (payload: CreateHabitPayload): Promise<HabitWithStats> => {
    const res = await apiClient.post<HabitWithStats>('/habits', payload);
    return res.data;
  },

  update: async (habitId: string, payload: UpdateHabitPayload): Promise<HabitWithStats> => {
    const res = await apiClient.patch<HabitWithStats>(`/habits/${habitId}`, payload);
    return res.data;
  },

  remove: async (habitId: string): Promise<{ message: string }> => {
    const res = await apiClient.delete<{ message: string }>(`/habits/${habitId}`);
    return res.data;
  },

  checkIn: async (habitId: string, payload?: CheckInPayload): Promise<{ message: string }> => {
    const res = await apiClient.post<{ message: string }>(`/habits/${habitId}/check-in`, payload ?? {});
    return res.data;
  },

  undoCheckIn: async (habitId: string): Promise<{ message: string }> => {
    const res = await apiClient.delete<{ message: string }>(`/habits/${habitId}/check-in`);
    return res.data;
  },
};
