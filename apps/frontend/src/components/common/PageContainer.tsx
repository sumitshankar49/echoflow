"use client";

import { motion } from 'framer-motion';
import { usePathname } from 'next/navigation';
import type { PropsWithChildren } from 'react';

import { cn } from '@/lib/utils';

interface PageContainerProps extends PropsWithChildren {
  className?: string;
}

export function PageContainer({ children, className }: PageContainerProps) {
  const pathname = usePathname();

  return (
    <motion.section
      key={pathname}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.24, ease: 'easeOut' }}
      className={cn(
        'mx-auto w-full max-w-[1320px] space-y-6 px-4 pb-10 pt-3 sm:space-y-7 sm:px-6 lg:px-8',
        className,
      )}
    >
      {children}
    </motion.section>
  );
}
