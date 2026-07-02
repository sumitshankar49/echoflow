export type JournalMood = 'happy' | 'calm' | 'neutral' | 'anxious' | 'sad' | 'excited';

export interface JournalEntry {
  id: string;
  title: string;
  content: string;
  mood: JournalMood;
  tags: string[];
  date: string;
  createdAt: string;
  userId: string;
}

export interface JournalFilters {
  date?: string;
  mood?: JournalMood;
}

export interface CreateJournalPayload {
  title: string;
  content: string;
  mood: JournalMood;
  tags?: string[];
  date: string;
}

export type UpdateJournalPayload = Partial<CreateJournalPayload>;
