import Link from 'next/link';
import { CircleDot, Lightbulb } from 'lucide-react';
import { motion } from 'framer-motion';
import type { DashboardSuggestion } from '../types';

type SmartSuggestionsCardProps = {
  smartSuggestions: DashboardSuggestion[];
};

export function SmartSuggestionsCard({ smartSuggestions }: SmartSuggestionsCardProps) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.2 }}
      className="h-full xl:col-span-4 rounded-2xl border border-border/70 bg-card/85 p-5 shadow-[0_18px_40px_-34px_rgba(15,23,42,0.65)]"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Smart suggestions</p>
          <h2 className="mt-2 text-xl font-semibold tracking-tight">Gentle next actions</h2>
        </div>
        <Lightbulb className="h-5 w-5 text-amber-500" />
      </div>

      <div className="mt-4 space-y-3">
        {smartSuggestions.map((item) => (
          <motion.div
            key={item.id}
            whileHover={{ y: -2 }}
            className="rounded-xl border border-border/70 bg-background/70 p-3"
          >
            <div className="flex items-start gap-2">
              <CircleDot className="mt-1 h-4 w-4 text-cyan-500" />
              <div>
                <p className="font-medium">{item.title}</p>
                <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>
                <Link
                  href={item.href}
                  className="mt-2 inline-block text-xs font-medium uppercase tracking-[0.16em] text-cyan-600 hover:underline"
                >
                  Open
                </Link>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.article>
  );
}
