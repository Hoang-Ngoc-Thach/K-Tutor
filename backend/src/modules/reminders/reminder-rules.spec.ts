import { decideReminder, ReminderConfig } from './reminder-rules';

const config: ReminderConfig = {
  inactiveDays: 3,
  cooldownDays: 7,
  maxInRow: 3,
};
const now = new Date('2026-11-20T12:00:00Z');
const daysAgo = (days: number) => new Date(now.getTime() - days * 86_400_000);

describe('decideReminder', () => {
  it('does not remind a learner who was active recently', () => {
    const result = decideReminder(
      { lastActivityAt: daysAgo(2), lastReminderAt: null, reminderCount: 0 },
      now,
      config,
    );
    expect(result).toEqual({ send: false, reason: 'recently_active' });
  });

  it('sends the first reminder after enough inactive days', () => {
    const result = decideReminder(
      { lastActivityAt: daysAgo(5), lastReminderAt: null, reminderCount: 0 },
      now,
      config,
    );
    expect(result).toEqual({ send: true, daysInactive: 5, nextCount: 1 });
  });

  it('waits for the cooldown between two reminders', () => {
    const result = decideReminder(
      {
        lastActivityAt: daysAgo(10),
        lastReminderAt: daysAgo(3),
        reminderCount: 1,
      },
      now,
      config,
    );
    expect(result).toEqual({ send: false, reason: 'cooldown' });
  });

  it('sends the next reminder once the cooldown has passed', () => {
    const result = decideReminder(
      {
        lastActivityAt: daysAgo(15),
        lastReminderAt: daysAgo(8),
        reminderCount: 1,
      },
      now,
      config,
    );
    expect(result).toEqual({ send: true, daysInactive: 15, nextCount: 2 });
  });

  it('stops after the maximum number of reminders in a row', () => {
    const result = decideReminder(
      {
        lastActivityAt: daysAgo(40),
        lastReminderAt: daysAgo(8),
        reminderCount: 3,
      },
      now,
      config,
    );
    expect(result).toEqual({ send: false, reason: 'max_reached' });
  });

  it('starts counting again after the learner studied since the last reminder', () => {
    // Reminded 20 days ago (3 times), studied 10 days ago, inactive again now.
    const result = decideReminder(
      {
        lastActivityAt: daysAgo(10),
        lastReminderAt: daysAgo(20),
        reminderCount: 3,
      },
      now,
      config,
    );
    expect(result).toEqual({ send: true, daysInactive: 10, nextCount: 1 });
  });
});
