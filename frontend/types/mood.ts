/**
 * frontend/types/mood.ts
 * TypeScript type definitions for SkillsCatalyst Daily Mood Tracker and Calendar system.
 */

export type MoodType = 'happy' | 'angry' | 'sleepy' | 'bored' | 'calm' | 'wacky' | 'pouty';

export interface MoodLog {
  id: string;
  user_id: string;
  log_date: string; // YYYY-MM-DD
  mood: MoodType;
  note?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface MonthlyMoodSummary {
  year: number;
  month: number;
  logs: MoodLog[];
  predominant_mood: MoodType | null;
  total_logged: number;
  mood_counts: Record<string, number>;
}

export interface WeeklyMoodSummary {
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  logs: MoodLog[];
  predominant_mood: MoodType | null;
  total_logged: number;
  mood_counts: Record<string, number>;
}

export interface LogMoodPayload {
  mood: MoodType;
  log_date?: string; // YYYY-MM-DD (defaults to today)
  note?: string;
}
