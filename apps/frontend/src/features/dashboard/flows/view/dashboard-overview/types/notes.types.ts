import type { Note } from '@/features/notes/shared/domain/notes.types';

export type DashboardNote = Pick<Note, 'id' | 'title' | 'content' | 'updatedAt'>;
