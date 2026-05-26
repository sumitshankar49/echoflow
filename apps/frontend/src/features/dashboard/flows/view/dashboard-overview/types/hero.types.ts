import type { UserProfile } from '@/features/users/shared/domain/users.types';

export type DashboardUser = Pick<UserProfile, 'name'>;

export type DashboardHeroSummary = {
  notesCount: number;
  topRemindersCount: number;
  activeCirclesCount: number;
  nextReminderTitle?: string;
  recentNoteTitle?: string;
  playlistName?: string;
};
