/**
 * frontend/lib/api/moods.ts
 * Production-ready API and Supabase client layer for Daily Mood Tracking.
 * Features Supabase RLS querying with local caching resilience and calendar math.
 */

import { supabase } from "@/lib/supabase";
import { MoodLog, MonthlyMoodSummary, LogMoodPayload, MoodType } from "@/types/mood";

const LOCAL_MOODS_KEY_PREFIX = "sc_user_moods_";

function getLocalMoods(userId: string): MoodLog[] {
  if (typeof window === "undefined" || !userId) return [];
  try {
    const raw = localStorage.getItem(`${LOCAL_MOODS_KEY_PREFIX}${userId}`);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (err) {
    console.warn("Failed to read local moods:", err);
  }
  return [];
}

function saveLocalMoods(userId: string, logs: MoodLog[]): void {
  if (typeof window === "undefined" || !userId) return;
  try {
    localStorage.setItem(`${LOCAL_MOODS_KEY_PREFIX}${userId}`, JSON.stringify(logs));
  } catch (err) {
    console.warn("Failed to save local moods:", err);
  }
}

/**
 * Formats a Date object to YYYY-MM-DD in local time
 */
export function formatLocalDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/**
 * Returns today's date formatted as YYYY-MM-DD in local time
 */
export function getTodayDateString(): string {
  return formatLocalDate(new Date());
}

/**
 * Calculates calendar grid data for any given year and month (1-12)
 * Sun = 0, Mon = 1, ..., Sat = 6
 */
export interface CalendarCell {
  dateStr: string; // YYYY-MM-DD
  dayNumber: number;
  isCurrentMonth: boolean;
  isToday: boolean;
}

export function computeCalendarGrid(year: number, month: number): CalendarCell[] {
  const todayStr = getTodayDateString();
  
  // Date constructor month is 0-indexed (0 = Jan, 11 = Dec)
  const firstDayOfWeek = new Date(year, month - 1, 1).getDay(); // 0 (Sun) to 6 (Sat)
  const totalDaysInMonth = new Date(year, month, 0).getDate();
  const prevMonthTotalDays = new Date(year, month - 1, 0).getDate();

  const cells: CalendarCell[] = [];

  // 1. Leading days from previous month
  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    const day = prevMonthTotalDays - i;
    const prevDate = new Date(year, month - 2, day);
    const dateStr = formatLocalDate(prevDate);
    cells.push({
      dateStr,
      dayNumber: day,
      isCurrentMonth: false,
      isToday: dateStr === todayStr,
    });
  }

  // 2. Days of the current month
  for (let d = 1; d <= totalDaysInMonth; d++) {
    const currentDate = new Date(year, month - 1, d);
    const dateStr = formatLocalDate(currentDate);
    cells.push({
      dateStr,
      dayNumber: d,
      isCurrentMonth: true,
      isToday: dateStr === todayStr,
    });
  }

  // 3. Trailing days from next month to complete the 7-column grid rows
  const remainingSlots = (7 - (cells.length % 7)) % 7;
  for (let d = 1; d <= remainingSlots; d++) {
    const nextDate = new Date(year, month, d);
    const dateStr = formatLocalDate(nextDate);
    cells.push({
      dateStr,
      dayNumber: d,
      isCurrentMonth: false,
      isToday: dateStr === todayStr,
    });
  }

  return cells;
}

/**
 * Calculates dominant mood and mood counts from a list of logs
 */
export function summarizeMoods(year: number, month: number, logs: MoodLog[]): MonthlyMoodSummary {
  const counts: Record<string, number> = {};
  
  for (const log of logs) {
    if (log.mood) {
      counts[log.mood] = (counts[log.mood] || 0) + 1;
    }
  }

  let predominant: MoodType | null = null;
  let maxCount = 0;

  for (const [mood, count] of Object.entries(counts)) {
    if (count > maxCount) {
      maxCount = count;
      predominant = mood as MoodType;
    }
  }

  return {
    year,
    month,
    logs,
    predominant_mood: predominant,
    total_logged: logs.length,
    mood_counts: counts,
  };
}

/**
 * Fetches mood logs for a user for a given year & month (1-indexed: 1 = Jan, 12 = Dec)
 */
export async function fetchMonthlyMoods(
  userId: string,
  year: number,
  month: number
): Promise<MonthlyMoodSummary> {
  const lastDay = new Date(year, month, 0).getDate();
  const startDate = `${year}-${String(month).padStart(2, "0")}-01`;
  const endDate = `${year}-${String(month).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;

  // Direct Supabase query
  try {
    const { data, error } = await supabase
      .from("user_daily_mood_logs")
      .select("id, user_id, log_date, mood, note, created_at, updated_at")
      .eq("user_id", userId)
      .gte("log_date", startDate)
      .lte("log_date", endDate)
      .order("log_date", { ascending: true });

    if (!error && data) {
      const logs = data as MoodLog[];
      // Update local storage backup for this month
      const local = getLocalMoods(userId);
      const filteredLocal = local.filter((l) => l.log_date < startDate || l.log_date > endDate);
      saveLocalMoods(userId, [...filteredLocal, ...logs]);

      return summarizeMoods(year, month, logs);
    }
  } catch (err) {
    console.warn("Supabase fetch failed, falling back to local cache:", err);
  }

  // Fallback to local storage
  const localLogs = getLocalMoods(userId).filter(
    (l) => l.log_date >= startDate && l.log_date <= endDate
  );
  return summarizeMoods(year, month, localLogs);
}

/**
 * Logs or updates a daily mood entry for the user
 */
export async function logUserDailyMood(
  userId: string,
  payload: LogMoodPayload
): Promise<MoodLog> {
  const logDate = payload.log_date || getTodayDateString();
  const nowIso = new Date().toISOString();

  const newLog: MoodLog = {
    id: typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `mood_${Date.now()}`,
    user_id: userId,
    log_date: logDate,
    mood: payload.mood,
    note: payload.note || null,
    created_at: nowIso,
    updated_at: nowIso,
  };

  // 1. Optimistically update local storage
  const local = getLocalMoods(userId);
  const existingIdx = local.findIndex((l) => l.log_date === logDate);
  if (existingIdx >= 0) {
    local[existingIdx] = { ...local[existingIdx], ...newLog, id: local[existingIdx].id };
  } else {
    local.push(newLog);
  }
  saveLocalMoods(userId, local);

  // 2. Persist to Supabase
  try {
    const { data, error } = await supabase
      .from("user_daily_mood_logs")
      .upsert(
        {
          user_id: userId,
          log_date: logDate,
          mood: payload.mood,
          note: payload.note || null,
          updated_at: nowIso,
        },
        { onConflict: "user_id,log_date" }
      )
      .select()
      .single();

    if (!error && data) {
      return data as MoodLog;
    }
  } catch (err) {
    console.warn("Failed to sync mood to Supabase, local cache retained:", err);
  }

  return newLog;
}

/**
 * Removes a mood log for a specific date
 */
export async function deleteUserDailyMood(userId: string, logDate: string): Promise<boolean> {
  // Update local storage
  const local = getLocalMoods(userId).filter((l) => l.log_date !== logDate);
  saveLocalMoods(userId, local);

  try {
    const { error } = await supabase
      .from("user_daily_mood_logs")
      .delete()
      .eq("user_id", userId)
      .eq("log_date", logDate);

    return !error;
  } catch (err) {
    console.warn("Failed to delete mood log from Supabase:", err);
    return false;
  }
}
