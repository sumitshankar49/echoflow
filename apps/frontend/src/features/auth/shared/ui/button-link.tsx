'use client';

import Link from 'next/link';

import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ButtonLinkProps {
  ariaLabel: string;
  disabled?: boolean;
  linkPath: string;
  variant?: 'link' | 'default' | 'secondary' | 'outline' | 'ghost' | 'destructive';
  label: string;
}

export function ButtonLink({
  ariaLabel,
  disabled = false,
  linkPath,
  variant = 'link',
  label,
}: ButtonLinkProps) {
  if (disabled) {
    return (
      <span
        aria-label={ariaLabel}
        className={cn(buttonVariants({ variant }), 'pointer-events-none opacity-50')}
      >
        {label}
      </span>
    );
  }

  return (
    <Link aria-label={ariaLabel} href={linkPath} className={buttonVariants({ variant })}>
      {label}
    </Link>
  );
}