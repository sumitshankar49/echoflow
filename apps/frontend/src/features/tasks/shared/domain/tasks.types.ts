export type TaskPriority = 'low' | 'medium' | 'high';

export interface Task {
  id: string;
  title: string;
  description: string | null;
  dueDate: string;
  priority: TaskPriority;
  isCompleted: boolean;
  tags: string[];
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskPayload {
  title: string;
  description?: string;
  dueDate: string;
  priority: TaskPriority;
  isCompleted?: boolean;
  tags?: string[];
}

export interface UpdateTaskPayload {
  title?: string;
  description?: string | null;
  dueDate?: string;
  priority?: TaskPriority;
  isCompleted?: boolean;
  tags?: string[];
}