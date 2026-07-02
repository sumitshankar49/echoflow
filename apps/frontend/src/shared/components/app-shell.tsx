"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import {
  CalendarDays,
  LayoutDashboard,
  Brain,
  BookOpen,
  CheckSquare2,
  StickyNote,
  Users,
  Bell,
  Music,
  Timer,
  Activity,
  UserCog,
  Power,
  Loader2,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  X,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { PageContainer } from '@/components/common/PageContainer';
import { PageHeader } from '@/components/common/PageHeader';
import { authService } from '@/features/auth/shared/data/auth.service';
import { GlobalMusicPlaybackEngine } from '@/shared/components/global-music-playback-engine';
import { GlobalVoiceNoteWidget } from '@/shared/components/global-voice-note-widget';
import { useAuthStore } from '@/shared/store/auth.store';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/journal', label: 'Journal', icon: BookOpen },
  { href: '/tasks', label: 'Tasks', icon: CheckSquare2 },
  { href: '/memories', label: 'Memories', icon: Brain },
  { href: '/profile', label: 'Profile', icon: UserCog },
  { href: '/notes', label: 'Notes', icon: StickyNote },
  { href: '/circles', label: 'Circles', icon: Users },
  { href: '/reminders', label: 'Reminders', icon: Bell },
  { href: '/music', label: 'Music', icon: Music },
  { href: '/focus', label: 'Focus', icon: Timer },
  { href: '/habits', label: 'HabitFlow', icon: Activity },
];

const pageDescriptions: Record<string, string> = {
  Dashboard: 'Your productivity snapshot, priorities, and quick actions in one place.',
  Journal: 'Capture the day with structured reflections and meaningful entries.',
  Tasks: 'Plan, prioritize, and complete work with clear momentum.',
  Memories: 'Revisit insights from notes, journals, and tasks in a unified archive.',
  Profile: 'Personalize your EchoFlow experience and account preferences.',
  Notes: 'Collect ideas and references with a clean writing-focused workspace.',
  Circles: 'Collaborate with your circle through shared context and updates.',
  Reminders: 'Keep commitments on track with timely nudges and visibility.',
  Music: 'Curate focused soundscapes and playlists for deep work.',
  Focus: 'Stay locked in with intentional sessions and ambient support.',
  HabitFlow: 'A smooth, modern ritual space for streaks, check-ins, and momentum.',
};

function formatToday() {
  return new Date().toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const clearTokens = useAuthStore((state) => state.clearTokens);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const onLogout = () => {
    if (isLoggingOut) {
      return;
    }

    setIsLoggingOut(true);

    const refreshToken = localStorage.getItem('refresh_token');

    clearTokens();

    if (refreshToken) {
      void authService.logout(refreshToken).catch(() => {
        // Proceed with local logout even if API logout fails.
      });
    }

    window.location.replace('/login');
  };

  const currentPage =
    navItems.find((item) => pathname === item.href || pathname.startsWith(`${item.href}/`))?.label || 'EchoFlow';

  const currentDescription = pageDescriptions[currentPage] ?? 'A calm, consistent workspace for your daily flow.';

  return (
    <div className="relative min-h-screen bg-background lg:flex">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,rgba(99,102,241,0.14),transparent_38%),radial-gradient(circle_at_top_right,rgba(129,140,248,0.12),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(14,165,233,0.08),transparent_28%)]" />

      {isMobileMenuOpen ? (
        <button
          type="button"
          aria-label="Close menu"
          className="fixed inset-0 z-40 bg-black/45 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      ) : null}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-sidebar-border bg-sidebar/95 p-4 shadow-2xl shadow-black/20 backdrop-blur-xl transition-all duration-300 lg:sticky lg:top-0 lg:h-screen lg:shrink-0 lg:shadow-none ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } ${
          isSidebarCollapsed ? 'lg:w-[5.3rem]' : 'lg:w-[16rem]'
        }`}
      >
        <div className="mb-6 flex items-center">
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary text-xs font-bold text-primary-foreground shadow-lg shadow-primary/30">
              EF
            </div>
            {!isSidebarCollapsed ? (
              <div>
                <p className="text-lg font-semibold tracking-tight text-sidebar-foreground">EchoFlow</p>
                <p className="text-xs text-sidebar-foreground/70">Premium workspace</p>
              </div>
            ) : null}
            <p className="text-xl font-bold tracking-tight text-sidebar-foreground lg:hidden">EchoFlow</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto">
          {navItems.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              title={isSidebarCollapsed ? label : undefined}
              onClick={() => setIsMobileMenuOpen(false)}
              className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-sidebar-foreground/80 transition-all hover:bg-sidebar-accent hover:text-sidebar-accent-foreground ${
                pathname === href || pathname.startsWith(`${href}/`) ? 'bg-sidebar-accent text-sidebar-accent-foreground shadow-[inset_0_0_0_1px_color-mix(in_srgb,var(--sidebar-primary)_24%,transparent)]' : ''
              } ${
                isSidebarCollapsed ? 'lg:justify-center lg:gap-0' : ''
              }`}
            >
              <Icon className="h-4 w-4" />
              <span className={isSidebarCollapsed ? 'lg:hidden' : ''}>{label}</span>
            </Link>
          ))}
        </nav>

        <div className="mt-4 space-y-2 border-t border-sidebar-border pt-3">
          <Button
            type="button"
            variant="outline"
            onClick={onLogout}
            disabled={isLoggingOut}
            title={isSidebarCollapsed ? 'Logout' : undefined}
            aria-label="Logout"
            className={isSidebarCollapsed ? 'h-10 w-full justify-start gap-2 border-sidebar-border bg-sidebar/70 text-sidebar-foreground hover:bg-sidebar-accent lg:h-10 lg:w-10 lg:p-0' : 'h-10 w-full justify-start gap-2 border-sidebar-border bg-sidebar/70 text-sidebar-foreground hover:bg-sidebar-accent'}
          >
            {isLoggingOut ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Power className="h-4 w-4" />
            )}
            <span className={isSidebarCollapsed ? 'lg:hidden' : ''}>
              {isLoggingOut ? 'Logging out...' : 'Logout'}
            </span>
          </Button>

          <div className="flex justify-end">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => setIsSidebarCollapsed((value) => !value)}
              aria-label={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              className="hidden h-9 w-9 text-sidebar-foreground/75 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground lg:inline-flex"
            >
              {isSidebarCollapsed ? (
                <PanelLeftOpen className="h-4 w-4" />
              ) : (
                <PanelLeftClose className="h-4 w-4" />
              )}
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => setIsMobileMenuOpen(false)}
              aria-label="Close menu"
              className="h-9 w-9 text-sidebar-foreground/75 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground lg:hidden"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </aside>

      <main className="min-w-0 flex-1 overflow-y-auto pb-8">
        <div className="sticky top-0 z-30 mb-3 flex items-center justify-between border-b border-border/75 bg-background/90 px-4 py-3 backdrop-blur lg:hidden">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary text-[10px] font-bold text-primary-foreground">
              EF
            </div>
            <div>
              <p className="text-sm font-semibold tracking-tight">EchoFlow</p>
              <p className="text-xs text-muted-foreground">{currentPage}</p>
            </div>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => setIsMobileMenuOpen(true)}
            aria-label="Open menu"
            className="h-9 w-9"
          >
            <Menu className="h-4 w-4" />
          </Button>
        </div>

        <PageContainer>
          <PageHeader
            title={currentPage}
            description={currentDescription}
            eyebrow="EchoFlow Workspace"
            actions={
              <div className="hidden items-center gap-2 rounded-xl border border-border/70 bg-background/80 px-3 py-2 text-xs text-muted-foreground shadow-sm sm:inline-flex">
                <CalendarDays className="h-3.5 w-3.5 text-primary" />
                <span>{formatToday()}</span>
              </div>
            }
          />
          {children}
        </PageContainer>
      </main>

      <GlobalMusicPlaybackEngine />
      <GlobalVoiceNoteWidget />
    </div>
  );
}
