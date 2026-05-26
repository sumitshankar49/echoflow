export interface DashboardOverviewUser {
  name: string;
}

export interface DashboardOverviewSummary {
  notesCount: number;
  pendingRemindersCount: number;
  activeCirclesCount: number;
  playlistsCount: number;
}

export interface DashboardOverviewNote {
  id: string;
  title: string;
  content: string;
  updatedAt: Date;
}

export interface DashboardOverviewReminder {
  id: string;
  title: string;
  remindAt: Date;
}

export interface DashboardOverviewCircleMember {
  id: string;
  circleId: string;
  userId: string;
  role: string;
  status: string;
  user?: {
    id: string;
    name: string;
    email: string;
  };
}

export interface DashboardOverviewCircle {
  id: string;
  name: string;
  members: DashboardOverviewCircleMember[];
}

export interface DashboardOverviewPlaylist {
  id: string;
  name: string;
  urls: string[];
}

export interface DashboardOverviewResponse {
  me: DashboardOverviewUser | null;
  summary: DashboardOverviewSummary;
  recentNotes: DashboardOverviewNote[];
  upcomingReminders: DashboardOverviewReminder[];
  activeCircles: DashboardOverviewCircle[];
  quickPlayerPlaylist: DashboardOverviewPlaylist | null;
}
