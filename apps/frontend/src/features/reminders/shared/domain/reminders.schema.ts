import { z } from 'zod';

export const createReminderSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  dueAt: z.string().min(1, 'Due date is required'),
});

export const updateReminderSchema = createReminderSchema
  .partial()
  .extend({ isCompleted: z.boolean().optional() });

export type CreateReminderSchema = z.infer<typeof createReminderSchema>;
export type UpdateReminderSchema = z.infer<typeof updateReminderSchema>;
