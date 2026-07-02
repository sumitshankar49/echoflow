'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { HabitLog } from '../../shared/domain/habits.types';

interface HabitHeatmapProps {
  logs: HabitLog[];
  color: string;
}

const WEEKS = 26; // ~6 months
const DAYS_PER_WEEK = 7;

function getDateKey(date: Date): string {
  return date.toISOString().split('T')[0];
}

function buildGrid(): Date[] {
  const days: Date[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Start from the Sunday at or before (WEEKS * 7) days ago
  const start = new Date(today);
  start.setDate(start.getDate() - WEEKS * DAYS_PER_WEEK + 1);
  // Align to Sunday
  const dayOfWeek = start.getDay();
  start.setDate(start.getDate() - dayOfWeek);

  for (let i = 0; i < WEEKS * DAYS_PER_WEEK; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    days.push(d);
  }
  return days;
}

const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

export function HabitHeatmap({ logs, color }: HabitHeatmapProps) {
  const logSet = useMemo(() => new Set(logs.map((l) => l.logDate.split('T')[0])), [logs]);

  const grid = useMemo(() => buildGrid(), []);

  // Group into weeks (columns)
  const weeks: Date[][] = [];
  for (let w = 0; w < WEEKS; w++) {
    weeks.push(grid.slice(w * DAYS_PER_WEEK, (w + 1) * DAYS_PER_WEEK));
  }

  // Month labels: track first occurrence of each month
  const monthPositions: { label: string; col: number }[] = [];
  weeks.forEach((week, col) => {
    const firstDay = week[0];
    if (firstDay && firstDay.getDate() <= 7) {
      const prev = monthPositions[monthPositions.length - 1];
      if (!prev || prev.label !== MONTH_LABELS[firstDay.getMonth()]) {
        monthPositions.push({ label: MONTH_LABELS[firstDay.getMonth()], col });
      }
    }
  });

  const todayKey = getDateKey(new Date());

  return (
    <div className="w-full overflow-x-auto">
      <div className="min-w-[480px]">
        {/* Month labels */}
        <div className="mb-1 flex pl-7">
          {monthPositions.map(({ label, col }, i) => (
            <div
              key={`${label}-${col}`}
              className="text-[10px] text-white/30"
              style={{
                marginLeft: i === 0 ? col * 14 : (col - (monthPositions[i - 1]?.col ?? 0)) * 14 - 12,
              }}
            >
              {label}
            </div>
          ))}
        </div>

        <div className="flex gap-0.5">
          {/* Day-of-week labels */}
          <div className="flex flex-col gap-0.5 pr-1.5">
            {DAY_LABELS.map((d, i) => (
              <div
                key={i}
                className="flex h-[12px] w-4 items-center justify-center text-[9px] text-white/25"
              >
                {i % 2 === 1 ? d : ''}
              </div>
            ))}
          </div>

          {/* Week columns */}
          {weeks.map((week, wIdx) => (
            <div key={wIdx} className="flex flex-col gap-0.5">
              {week.map((day, dIdx) => {
                const key = getDateKey(day);
                const isFilled = logSet.has(key);
                const isToday = key === todayKey;
                const isFuture = day > new Date();

                return (
                  <motion.div
                    key={key}
                    title={key}
                    className={cn(
                      'h-[12px] w-[12px] rounded-[3px] transition-transform',
                      isFuture ? 'opacity-0' : '',
                      isToday && !isFilled ? 'ring-1 ring-white/30' : '',
                    )}
                    style={{
                      backgroundColor: isFilled ? color : 'rgba(255,255,255,0.07)',
                      opacity: isFuture ? 0 : isFilled ? 1 : 0.6,
                    }}
                    whileHover={isFilled ? { scale: 1.4 } : { scale: 1.2 }}
                    initial={isFilled ? { scale: 0, opacity: 0 } : undefined}
                    animate={isFilled ? { scale: 1, opacity: 1 } : undefined}
                    transition={{ delay: (wIdx * 7 + dIdx) * 0.001, duration: 0.25 }}
                  />
                );
              })}
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="mt-2 flex items-center justify-end gap-1.5">
          <span className="text-[10px] text-white/25">Less</span>
          {[0.15, 0.35, 0.6, 0.8, 1].map((op, i) => (
            <div
              key={i}
              className="h-[10px] w-[10px] rounded-[2px]"
              style={{ backgroundColor: color, opacity: op }}
            />
          ))}
          <span className="text-[10px] text-white/25">More</span>
        </div>
      </div>
    </div>
  );
}
