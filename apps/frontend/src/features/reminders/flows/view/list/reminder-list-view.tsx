'use client';

import { format } from 'date-fns';
import { useReminderList } from './use-reminder-list';

export function ReminderListView() {
  const { data: reminders, isPending, isError } = useReminderList();

  if (isPending) return <p className="text-sm text-muted-foreground">Loading reminders…</p>;
  if (isError) return <p className="text-sm text-red-500">Failed to load reminders.</p>;

  return (
    <ul className="space-y-3">
      {reminders.map((reminder) => (
        <li
          key={reminder.id}
          className="flex items-start justify-between rounded-xl border p-4 shadow-sm"
        >
          <div>
            <h3 className={`font-semibold ${reminder.isCompleted ? 'line-through opacity-50' : ''}`}>
              {reminder.title}
            </h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Due {format(new Date(reminder.dueAt), 'PPp')}
            </p>
          </div>
        </li>
      ))}
    </ul>
  );
}
