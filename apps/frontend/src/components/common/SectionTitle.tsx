import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

interface SectionTitleProps {
  title: string;
  description?: string;
  action?: ReactNode;
  icon?: ReactNode;
  className?: string;
}

export function SectionTitle({ title, description, action, icon, className }: SectionTitleProps) {
  return (
    <div className={cn('flex flex-wrap items-start justify-between gap-3', className)}>
      <div className="space-y-1">
        <h2 className="inline-flex items-center gap-2 text-lg font-semibold tracking-tight text-foreground sm:text-xl">
          {icon}
          {title}
        </h2>
        {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
