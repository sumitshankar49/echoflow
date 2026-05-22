import { z } from 'zod';

export const createReminderSchema = z.object({
  title: z.string().min(1, 'Title is required').max(150, 'Title is too long'),
  description: z.string().max(500, 'Description is too long').optional(),
  remindAt: z.string().min(1, 'Due date is required'),
});

export const updateReminderSchema = createReminderSchema
  .partial()
  .extend({ isCompleted: z.boolean().optional() });

export type CreateReminderSchema = z.infer<typeof createReminderSchema>;
export type UpdateReminderSchema = z.infer<typeof updateReminderSchema>;

