import type { PropsWithChildren, ReactNode } from 'react';

import { cn } from '@/lib/utils';

interface CardProps extends PropsWithChildren {
  className?: string;
  title?: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
}

export function Card({ className, children, title, description, action }: CardProps) {
  return (
    <section
      className={cn(
        'rounded-2xl border border-border/80 bg-card/95 p-5 shadow-[0_16px_40px_-32px_rgba(15,23,42,0.55)] backdrop-blur-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_24px_50px_-30px_rgba(79,70,229,0.35)] sm:p-6',
        className,
      )}
    >
      {title || description || action ? (
        <header className="mb-4 flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-1">
            {title ? <h3 className="text-base font-semibold tracking-tight text-foreground">{title}</h3> : null}
            {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
          </div>
          {action ? <div className="shrink-0">{action}</div> : null}
        </header>
      ) : null}
      {children}
    </section>
  );
}
