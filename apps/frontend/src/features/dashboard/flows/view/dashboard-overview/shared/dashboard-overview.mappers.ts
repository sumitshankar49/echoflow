import type {
  DashboardCircle,
  DashboardNote,
  DashboardOverviewResponse,
  DashboardPlaylist,
  DashboardReminder,
  DashboardSuggestion,
  DashboardUser,
} from '../types';

export type DashboardOverviewViewModel = {
  me: DashboardUser | null | undefined;
  notesCount: number;
  pendingRemindersCount: number;
  activeCirclesCount: number;
  topReminders: DashboardReminder[];
  recentNotes: DashboardNote[];
  activeCircles: DashboardCircle[];
  quickPlayerPlaylist: DashboardPlaylist | undefined;
  smartSuggestions: DashboardSuggestion[];
};

function buildDashboardSuggestions(params: {
  pendingRemindersCount: number;
  activeCircles: DashboardCircle[];
  quickPlayerPlaylist: DashboardPlaylist | undefined;
}): DashboardSuggestion[] {
  const { pendingRemindersCount, activeCircles, quickPlayerPlaylist } = params;
  const suggestions: DashboardSuggestion[] = [];

  if (pendingRemindersCount > 0) {
    suggestions.push({
      id: 'reminder-focus',
      title: 'Prep your next reminder block',
      description: `${pendingRemindersCount} reminder(s) pending. Stay on track without missing key tasks.`,
      href: '/reminders',
    });
  }

  if (activeCircles.length > 0) {
    suggestions.push({
      id: 'circle-touchpoint',
      title: 'Share one update in a circle',
      description:
        'A quick status update keeps everyone aligned, improves transparency, and reduces unnecessary follow-ups later.',
      href: '/circles',
    });
  }

  if (quickPlayerPlaylist) {
    suggestions.push({
      id: 'music-ritual',
      title: 'Start a focus music ritual',
      description: `Resume ${quickPlayerPlaylist.name} for calm momentum and a smoother transition into your work session.`,
      href: '/music',
    });
  }

  if (suggestions.length === 0) {
    suggestions.push({
      id: 'bootstrap',
      title: 'Create your first workflow loop',
      description:
        'Add one note, one reminder, and one playlist to activate your full EchoFlow dashboard experience.',
      href: '/notes',
    });
  }

  return suggestions.slice(0, 3);
}

export function createDashboardOverviewViewModel(
  overview?: DashboardOverviewResponse | null,
  quickPlayerPlaylistOverride?: DashboardPlaylist | null,
): DashboardOverviewViewModel {
  const pendingRemindersCount = overview?.summary.pendingRemindersCount ?? 0;
  const activeCircles = overview?.activeCircles ?? [];
  const quickPlayerPlaylist = quickPlayerPlaylistOverride === undefined
    ? overview?.quickPlayerPlaylist ?? undefined
    : quickPlayerPlaylistOverride ?? undefined;

  return {
    me: overview?.me,
    notesCount: overview?.summary.notesCount ?? 0,
    pendingRemindersCount,
    activeCirclesCount: overview?.summary.activeCirclesCount ?? 0,
    topReminders: overview?.upcomingReminders ?? [],
    recentNotes: overview?.recentNotes ?? [],
    activeCircles,
    quickPlayerPlaylist,
    smartSuggestions: buildDashboardSuggestions({
      pendingRemindersCount,
      activeCircles,
      quickPlayerPlaylist,
    }),
  };
}