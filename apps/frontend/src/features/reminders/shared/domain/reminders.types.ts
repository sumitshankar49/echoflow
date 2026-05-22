export interface Reminder {
  id: string;
  title: string;
  description: string | null;
  remindAt: string;
  isCompleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  totalPages: number;
}

export interface CreateReminderPayload {
  title: string;
  description?: string;
  remindAt: string;
  isCompleted?: boolean;
}

export interface UpdateReminderPayload {
  title?: string;
  description?: string;
  remindAt?: string;
  isCompleted?: boolean;
}

export interface ReminderFilters {
  isCompleted?: boolean;
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
}

export type ReminderStatus = 'all' | 'pending' | 'completed';

export type ReminderUrgency = 'overdue' | 'today' | 'soon' | 'upcoming' | 'done';
