import { z } from 'zod';

export const createPlaylistSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  description: z.string().optional(),
  urls: z.array(z.string().url('Invalid URL')).optional(),
});

export const updatePlaylistSchema = createPlaylistSchema.partial();

export type CreatePlaylistSchema = z.infer<typeof createPlaylistSchema>;
export type UpdatePlaylistSchema = z.infer<typeof updatePlaylistSchema>;
