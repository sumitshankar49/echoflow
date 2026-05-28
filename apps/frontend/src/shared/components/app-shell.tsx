"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import {
  LayoutDashboard,
  StickyNote,
  Users,
  Bell,
  Music,
  UserCog,
  Power,
  Loader2,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  X,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { authService } from '@/features/auth/shared/data/auth.service';
import { GlobalMusicPlaybackEngine } from '@/shared/components/global-music-playback-engine';
import { GlobalVoiceNoteWidget } from '@/shared/components/global-voice-note-widget';
import { useAuthStore } from '@/shared/store/auth.store';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/profile', label: 'Profile', icon: UserCog },
  { href: '/notes', label: 'Notes', icon: StickyNote },
  { href: '/circles', label: 'Circles', icon: Users },
  { href: '/reminders', label: 'Reminders', icon: Bell },
  { href: '/music', label: 'Music', icon: Music },
];

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

  return (
    <div className="min-h-screen lg:flex">
      {isMobileMenuOpen ? (
        <button
          type="button"
          aria-label="Close menu"
          className="fixed inset-0 z-40 bg-black/45 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      ) : null}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r bg-background p-4 shadow-xl transition-transform duration-300 lg:sticky lg:top-0 lg:h-screen lg:shrink-0 lg:bg-muted lg:shadow-none ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } ${
          isSidebarCollapsed ? 'lg:w-20' : 'lg:w-60'
        }`}
      >
        <div className="mb-6 flex items-center">
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-zinc-900 text-xs font-bold text-zinc-50 dark:bg-zinc-100 dark:text-zinc-900">
              EF
            </div>
            {!isSidebarCollapsed ? (
              <p className="text-xl font-bold tracking-tight">EchoFlow</p>
            ) : null}
            <p className="text-xl font-bold tracking-tight lg:hidden">EchoFlow</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto">
          {navItems.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              title={isSidebarCollapsed ? label : undefined}
              onClick={() => setIsMobileMenuOpen(false)}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium hover:bg-muted ${
                pathname === href || pathname.startsWith(`${href}/`) ? 'bg-muted text-foreground' : ''
              } ${
                isSidebarCollapsed ? 'lg:justify-center lg:gap-0' : ''
              }`}
            >
              <Icon className="h-4 w-4" />
              <span className={isSidebarCollapsed ? 'lg:hidden' : ''}>{label}</span>
            </Link>
          ))}
        </nav>

        <div className="mt-4 space-y-2 border-t pt-3">
          <Button
            type="button"
            variant="outline"
            onClick={onLogout}
            disabled={isLoggingOut}
            title={isSidebarCollapsed ? 'Logout' : undefined}
            aria-label="Logout"
            className={isSidebarCollapsed ? 'h-9 w-full justify-start gap-2 lg:h-9 lg:w-9 lg:p-0' : 'h-9 w-full justify-start gap-2'}
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
              className="hidden h-8 w-8 lg:inline-flex"
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
              className="h-8 w-8 lg:hidden"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </aside>

      <main className="min-w-0 flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
        <div className="sticky top-0 z-30 mb-4 flex items-center justify-between border-b bg-background px-3 py-3 lg:hidden">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-zinc-900 text-[10px] font-bold text-zinc-50 dark:bg-zinc-100 dark:text-zinc-900">
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
            className="h-8 w-8"
          >
            <Menu className="h-4 w-4" />
          </Button>
        </div>
        {children}
      </main>

      <GlobalMusicPlaybackEngine />
      <GlobalVoiceNoteWidget />
    </div>
  );
}
