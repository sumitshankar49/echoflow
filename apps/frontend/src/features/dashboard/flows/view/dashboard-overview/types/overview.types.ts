import type { DashboardCircle } from './circles.types';
import type { DashboardNote } from './notes.types';
import type { DashboardPlaylist } from './music.types';
import type { DashboardReminder } from './reminders.types';
import type { DashboardUser } from './hero.types';

export type DashboardOverviewSummary = {
  notesCount: number;
  pendingRemindersCount: number;
  activeCirclesCount: number;
  playlistsCount: number;
};

export type DashboardOverviewResponse = {
  me: DashboardUser | null;
  summary: DashboardOverviewSummary;
  recentNotes: DashboardNote[];
  upcomingReminders: DashboardReminder[];
  activeCircles: DashboardCircle[];
  quickPlayerPlaylist: DashboardPlaylist | null;
};
