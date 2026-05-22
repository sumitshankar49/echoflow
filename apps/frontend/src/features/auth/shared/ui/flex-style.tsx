'use client';

import { cn } from '@/lib/utils';

interface FlexStyleProps {
  direction?: 'row' | 'rowReverse' | 'col' | 'colReverse';
  items?: 'default' | 'start' | 'center' | 'end';
  justify?: 'default' | 'start' | 'center' | 'end' | 'between';
  className?: string;
  children: React.ReactNode;
}

const directionClass: Record<NonNullable<FlexStyleProps['direction']>, string> = {
  row: 'flex-row',
  rowReverse: 'flex-row-reverse',
  col: 'flex-col',
  colReverse: 'flex-col-reverse',
};

const itemsClass: Record<NonNullable<FlexStyleProps['items']>, string> = {
  default: 'items-stretch',
  start: 'items-start',
  center: 'items-center',
  end: 'items-end',
};

const justifyClass: Record<NonNullable<FlexStyleProps['justify']>, string> = {
  default: 'justify-start',
  start: 'justify-start',
  center: 'justify-center',
  end: 'justify-end',
  between: 'justify-between',
};

export function FlexStyle({
  direction = 'row',
  items = 'default',
  justify = 'default',
  className,
  children,
}: FlexStyleProps) {
  return (
    <div className={cn('flex', directionClass[direction], itemsClass[items], justifyClass[justify], className)}>
      {children}
    </div>
  );
}