// Pure rules that decide whether a learner should get a study reminder.
// No database or email here, so they are easy to test.

export const DAY_MS = 24 * 60 * 60 * 1000;

export interface ReminderConfig {
  // Send only after this many days without studying.
  inactiveDays: number;
  // Minimum days between two reminders to the same learner.
  cooldownDays: number;
  // Stop after this many reminders in a row with no study in between.
  maxInRow: number;
}

export interface ReminderState {
  // Latest sign of activity: sign-up, learned word, review or study day.
  lastActivityAt: Date;
  lastReminderAt: Date | null;
  reminderCount: number;
}

export type ReminderDecision =
  | { send: true; daysInactive: number; nextCount: number }
  | { send: false; reason: 'recently_active' | 'cooldown' | 'max_reached' };

export function decideReminder(
  state: ReminderState,
  now: Date,
  config: ReminderConfig,
): ReminderDecision {
  const daysInactive = Math.floor(
    (now.getTime() - state.lastActivityAt.getTime()) / DAY_MS,
  );
  if (daysInactive < config.inactiveDays) {
    return { send: false, reason: 'recently_active' };
  }

  // If the learner was active after the last reminder, the "in a row" count
  // starts again from zero.
  const countInRow =
    state.lastReminderAt && state.lastReminderAt >= state.lastActivityAt
      ? state.reminderCount
      : 0;
  if (countInRow >= config.maxInRow) {
    return { send: false, reason: 'max_reached' };
  }

  if (
    state.lastReminderAt &&
    now.getTime() - state.lastReminderAt.getTime() <
      config.cooldownDays * DAY_MS
  ) {
    return { send: false, reason: 'cooldown' };
  }

  return { send: true, daysInactive, nextCount: countInRow + 1 };
}
