import Link from 'next/link';
import { Clock3 } from 'lucide-react';
import { motion } from 'framer-motion';

import { ShimmerCard } from '@/components/common/ShimmerCard';

import { formatShortDate, stripHtml } from '../shared/dashboard-overview.utils';
import type { DashboardNote } from '../types';

type RecentNotesCardProps = {
  isPending: boolean;
  recentNotes: DashboardNote[];
};

export function RecentNotesCard({ isPending, recentNotes }: RecentNotesCardProps) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.08 }}
      className="h-full xl:col-span-5 rounded-2xl border border-border/70 bg-card/85 p-5 shadow-[0_18px_40px_-34px_rgba(15,23,42,0.65)]"
    >
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Recent notes</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight">Memory lane</h2>
        </div>
        <Link href="/notes" className="text-sm font-medium text-cyan-600 hover:underline">
          Open Notes
        </Link>
      </div>

      <div className="-mx-5 mt-4 overflow-x-auto px-5 pb-1">
        <div className="flex gap-3">
          {isPending ? (
            Array.from({ length: 3 }).map((_, index) => (
              <ShimmerCard
                key={index}
                lineCount={4}
                delay={index * 0.06}
                className="min-w-[78vw] max-w-[280px] border-border/50 bg-background/55 sm:min-w-[240px]"
              />
            ))
          ) : recentNotes.length ? (
            recentNotes.map((note) => (
              <motion.div
                key={note.id}
                whileHover={{ y: -2 }}
                className="min-w-[78vw] max-w-[280px] rounded-2xl border border-border/70 bg-background/70 p-4 sm:min-w-[240px]"
              >
                <p className="line-clamp-1 font-medium">{note.title}</p>
                <p className="mt-2 line-clamp-3 text-sm leading-6 text-muted-foreground">
                  {stripHtml(note.content) || 'No content yet'}
                </p>
                <div className="mt-3 inline-flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock3 className="h-3.5 w-3.5" />
                  {formatShortDate(note.updatedAt)}
                </div>
              </motion.div>
            ))
          ) : (
            <div className="rounded-2xl border border-dashed border-border/70 bg-background/60 p-4 text-sm text-muted-foreground">
              No recent notes yet.
            </div>
          )}
        </div>
      </div>
    </motion.article>
  );
}
