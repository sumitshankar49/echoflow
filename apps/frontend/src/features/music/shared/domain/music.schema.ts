import { z } from 'zod';

const acceptedTrackInput = z.string().trim().refine(
  (value) => {
    if (!value) {
      return true;
    }

    if (/^(https?:\/\/|file:\/\/)/i.test(value)) {
      return true;
    }

    return /^(\/|\.\/|\.\.\/)/.test(value);
  },
  'Use a YouTube URL, direct audio URL, or a local file path',
);

export const createPlaylistSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  description: z.string().optional(),
  urls: z.array(acceptedTrackInput).default([]),
});

export type CreatePlaylistSchema = z.infer<typeof createPlaylistSchema>;
