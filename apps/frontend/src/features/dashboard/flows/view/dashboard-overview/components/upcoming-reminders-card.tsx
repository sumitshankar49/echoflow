import { Bell } from 'lucide-react';
import { motion } from 'framer-motion';

import { ShimmerCard } from '@/components/common/ShimmerCard';

import { formatLongDate, relativeFromNow } from '../shared/dashboard-overview.utils';
import type { DashboardReminder } from '../types';

type UpcomingRemindersCardProps = {
  isPending: boolean;
  topReminders: DashboardReminder[];
};

export function UpcomingRemindersCard({ isPending, topReminders }: UpcomingRemindersCardProps) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.11 }}
      className="h-full xl:col-span-3 rounded-2xl border border-border/70 bg-card/85 p-5 shadow-[0_18px_40px_-34px_rgba(15,23,42,0.65)]"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Upcoming reminders</p>
          <h2 className="mt-2 text-xl font-semibold tracking-tight">Stay ahead</h2>
        </div>
        <Bell className="h-5 w-5 text-amber-500" />
      </div>

      <div className="mt-4 space-y-3">
        {isPending ? (
          Array.from({ length: 3 }).map((_, index) => (
            <ShimmerCard key={index} lineCount={2} delay={index * 0.06} className="border-border/50 bg-background/55 p-3" />
          ))
        ) : topReminders.length ? (
          topReminders.map((reminder) => (
            <div key={reminder.id} className="rounded-xl border border-border/70 bg-background/70 p-3">
              <p className="font-medium">{reminder.title}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {formatLongDate(reminder.remindAt)} • {relativeFromNow(reminder.remindAt)}
              </p>
            </div>
          ))
        ) : (
          <p className="rounded-xl border border-dashed border-border/70 bg-background/70 p-3 text-sm text-muted-foreground">
            No reminders lined up.
          </p>
        )}
      </div>
    </motion.article>
  );
}
