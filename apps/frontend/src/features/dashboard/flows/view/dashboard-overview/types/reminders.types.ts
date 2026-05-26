import type { Reminder } from '@/features/reminders/shared/domain/reminders.types';

export type DashboardReminder = Pick<Reminder, 'id' | 'title' | 'remindAt'>;
