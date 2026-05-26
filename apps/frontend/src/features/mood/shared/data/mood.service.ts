import { apiClient } from '@/shared/api/client';
import type { TodayMoodResponse } from '../domain/mood.types';

export const moodService = {
  today: () => apiClient.get<TodayMoodResponse>('/mood/today').then((response) => response.data),
};
