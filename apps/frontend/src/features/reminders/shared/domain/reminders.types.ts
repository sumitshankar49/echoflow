export interface Reminder {
  id: string;
  title: string;
  description?: string;
  dueAt: string;
  isCompleted: boolean;
  createdAt: string;
}

export interface CreateReminderPayload {
  title: string;
  description?: string;
  dueAt: string;
}

export interface UpdateReminderPayload {
  title?: string;
  description?: string;
  dueAt?: string;
  isCompleted?: boolean;
}
