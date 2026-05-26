import { Bell, Music2, StickyNote, Users } from 'lucide-react';
import type { QuickNavCard } from '../types';

export const quickNavCards: QuickNavCard[] = [
  {
    href: '/notes',
    label: 'Open Notes',
    icon: StickyNote,
    accent: 'from-sky-500/20 to-indigo-500/10',
  },
  {
    href: '/reminders',
    label: 'Check Reminders',
    icon: Bell,
    accent: 'from-amber-500/20 to-orange-500/10',
  },
  {
    href: '/circles',
    label: 'Visit Circles',
    icon: Users,
    accent: 'from-rose-500/20 to-fuchsia-500/10',
  },
  {
    href: '/music',
    label: 'Start Music',
    icon: Music2,
    accent: 'from-cyan-500/20 to-blue-500/10',
  },
] as const;
