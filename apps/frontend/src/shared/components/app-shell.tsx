"use client";

import Link from 'next/link';
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
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { authService } from '@/features/auth/shared/data/auth.service';
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
  const clearTokens = useAuthStore((state) => state.clearTokens);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

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

  return (
    <div className="flex min-h-screen">
      <aside
        className={`sticky top-0 flex h-screen shrink-0 flex-col border-r bg-muted/40 p-4 transition-all duration-300 ${
          isSidebarCollapsed ? 'w-20' : 'w-60'
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
          </div>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto">
          {navItems.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              title={isSidebarCollapsed ? label : undefined}
              className={`flex rounded-lg px-3 py-2 text-sm font-medium hover:bg-muted ${
                isSidebarCollapsed ? 'justify-center' : 'items-center gap-3'
              }`}
            >
              <Icon className="h-4 w-4" />
              {!isSidebarCollapsed ? label : null}
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
            className={isSidebarCollapsed ? 'h-9 w-9 p-0' : 'h-9 w-full justify-start gap-2'}
          >
            {isLoggingOut ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Power className="h-4 w-4" />
            )}
            {!isSidebarCollapsed ? (isLoggingOut ? 'Logging out...' : 'Logout') : null}
          </Button>

          <div className="flex justify-end">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => setIsSidebarCollapsed((value) => !value)}
              aria-label={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              className="h-8 w-8"
            >
              {isSidebarCollapsed ? (
                <PanelLeftOpen className="h-4 w-4" />
              ) : (
                <PanelLeftClose className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </aside>

      <main className="min-w-0 flex-1 overflow-y-auto p-8">
        {children}
      </main>

      <GlobalVoiceNoteWidget />
    </div>
  );
}
