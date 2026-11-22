// Pure helpers for the study streak (easy to unit test, no database).

// Days are calendar days in this timezone, so "today" is the same for the
// learner and the server.
export const STUDY_TIMEZONE = 'Asia/Ho_Chi_Minh';

// Formats a date as YYYY-MM-DD in the given timezone.
export function toDateString(
  date: Date,
  timeZone: string = STUDY_TIMEZONE,
): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}

// Adds (or subtracts) whole days to a YYYY-MM-DD string.
export function addDays(date: string, days: number): string {
  const moved = new Date(`${date}T00:00:00Z`);
  moved.setUTCDate(moved.getUTCDate() + days);
  return moved.toISOString().slice(0, 10);
}

export interface StreakResult {
  current: number; // consecutive days up to today (or yesterday)
  longest: number;
  studiedToday: boolean;
}

// The streak stays alive until the end of the day after the last study day:
// if the learner studied yesterday but not yet today, it still counts.
export function calculateStreak(dates: string[], today: string): StreakResult {
  const days = new Set(dates);

  const studiedToday = days.has(today);
  let cursor: string | null = null;
  if (studiedToday) {
    cursor = today;
  } else if (days.has(addDays(today, -1))) {
    cursor = addDays(today, -1);
  }

  let current = 0;
  while (cursor && days.has(cursor)) {
    current += 1;
    cursor = addDays(cursor, -1);
  }

  const sorted = [...days].sort();
  let longest = 0;
  let run = 0;
  let previous: string | null = null;
  for (const day of sorted) {
    run = previous !== null && addDays(previous, 1) === day ? run + 1 : 1;
    longest = Math.max(longest, run);
    previous = day;
  }

  return { current, longest, studiedToday };
}

// The last `count` days ending today, oldest first.
export function lastDays(
  dates: string[],
  today: string,
  count: number,
): { date: string; studied: boolean }[] {
  const days = new Set(dates);
  return Array.from({ length: count }, (_, index) => {
    const date = addDays(today, index - (count - 1));
    return { date, studied: days.has(date) };
  });
}
