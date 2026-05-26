export interface MoodPoint {
  date: string;
  mood: string | null;
}

export interface CurrentMood {
  mood: string | null;
  recordedAt: string | null;
}

export interface TodayMoodResponse {
  currentMood: CurrentMood;
  trend: MoodPoint[];
}
