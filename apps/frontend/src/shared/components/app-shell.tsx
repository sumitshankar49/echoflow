import Link from 'next/link';
import { LayoutDashboard, StickyNote, Users, Bell, Music } from 'lucide-react';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/notes', label: 'Notes', icon: StickyNote },
  { href: '/circles', label: 'Circles', icon: Users },
  { href: '/reminders', label: 'Reminders', icon: Bell },
  { href: '/music', label: 'Music', icon: Music },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <aside className="w-60 shrink-0 border-r bg-muted/40 p-4">
        <p className="mb-6 text-xl font-bold tracking-tight">EchoFlow</p>
        <nav className="space-y-1">
          {navItems.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium hover:bg-muted"
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          ))}
        </nav>
      </aside>
      <main className="flex-1 overflow-y-auto p-8">{children}</main>
    </div>
  );
}
