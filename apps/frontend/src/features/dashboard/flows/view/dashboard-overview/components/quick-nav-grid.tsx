import Link from 'next/link';
import { Compass } from 'lucide-react';
import { motion } from 'framer-motion';

import { cn } from '@/lib/utils';

import { quickNavCards } from '../shared/dashboard-overview.constants';

export function QuickNavGrid() {
  return (
    <section className="mt-1 grid gap-4 pt-2 sm:grid-cols-2 xl:grid-cols-4">
      {quickNavCards.map((card, index) => (
        <motion.div
          key={card.href}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: 0.05 * index }}
          whileHover={{ y: -3, scale: 1.01 }}
          className="group"
        >
          <Link
            href={card.href}
            className={cn(
              'relative flex min-h-[84px] items-center gap-3 overflow-hidden rounded-2xl border border-border/70 bg-card/80 p-4 shadow-[0_16px_34px_-30px_rgba(15,23,42,0.65)] transition-colors hover:border-cyan-400/35',
            )}
          >
            <div className={cn('absolute inset-0 bg-gradient-to-br opacity-70', card.accent)} />
            <div className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-white/20 bg-white/70 text-foreground">
              <card.icon className="h-5 w-5" />
            </div>
            <div className="relative min-w-0 flex-1">
              <p className="font-medium">{card.label}</p>
              <p className="text-xs text-muted-foreground">Quick jump</p>
            </div>
            <Compass className="relative h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
          </Link>
        </motion.div>
      ))}
    </section>
  );
}
