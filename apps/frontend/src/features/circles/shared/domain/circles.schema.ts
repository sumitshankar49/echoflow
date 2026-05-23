import { z } from 'zod';

export const createCircleSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  description: z.string().optional(),
});

export type CreateCircleSchema = z.infer<typeof createCircleSchema>;
