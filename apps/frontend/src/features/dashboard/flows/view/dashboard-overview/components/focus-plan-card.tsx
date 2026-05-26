import { motion } from 'framer-motion';

import { Button } from '@/components/ui/button';

type FocusPlanCardProps = {
  topRemindersCount: number;
  nextReminderTitle?: string;
  recentNoteTitle?: string;
};

export function FocusPlanCard({
  topRemindersCount,
  nextReminderTitle,
  recentNoteTitle,
}: FocusPlanCardProps) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.05 }}
      className="h-full xl:col-span-4 rounded-2xl border border-border/70 bg-card/85 p-5 shadow-[0_18px_40px_-34px_rgba(15,23,42,0.65)]"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Daily focus plan</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight">Build calm momentum</h2>
        </div>
        <div className="rounded-full border border-cyan-300/35 bg-cyan-300/10 px-3 py-1 text-xs font-medium text-cyan-700 dark:text-cyan-300">
          {topRemindersCount} task{topRemindersCount === 1 ? '' : 's'} queued
        </div>
      </div>

      <div className="mt-4 space-y-2 rounded-2xl border border-border/70 bg-background/70 p-4">
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Right now</p>
        <p className="text-sm text-foreground/90">
          {nextReminderTitle
            ? `Next reminder: ${nextReminderTitle}`
            : 'No urgent reminders. Great time to plan your next focus block.'}
        </p>
        <p className="text-sm text-foreground/90">
          {recentNoteTitle
            ? `Recent note: ${recentNoteTitle}`
            : 'No recent notes yet. Capture one key insight to start your day.'}
        </p>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <Button
          type="button"
          className="rounded-full"
          onClick={() => window.location.assign('/reminders')}
        >
          Plan reminders
        </Button>
        <Button
          type="button"
          variant="outline"
          className="rounded-full"
          onClick={() => window.location.assign('/notes')}
        >
          Open notes
        </Button>
      </div>
    </motion.article>
  );
}
