import { addDays, calculateStreak, lastDays, toDateString } from './streak';

describe('streak helpers', () => {
  it('adds days across month and year boundaries', () => {
    expect(addDays('2026-01-01', -1)).toBe('2025-12-31');
    expect(addDays('2026-02-27', 2)).toBe('2026-03-01');
  });

  it('formats a date in the study timezone, not in UTC', () => {
    // 20:00 UTC on 19 Nov is already 03:00 on 20 Nov in Ho Chi Minh City.
    const instant = new Date('2026-11-19T20:00:00Z');
    expect(toDateString(instant)).toBe('2026-11-20');
    expect(toDateString(instant, 'UTC')).toBe('2026-11-19');
  });

  describe('calculateStreak', () => {
    const today = '2026-11-19';

    it('is 0 when there is no study day', () => {
      expect(calculateStreak([], today)).toEqual({
        current: 0,
        longest: 0,
        studiedToday: false,
      });
    });

    it('counts consecutive days ending today', () => {
      const result = calculateStreak(
        ['2026-11-17', '2026-11-18', '2026-11-19'],
        today,
      );
      expect(result).toEqual({ current: 3, longest: 3, studiedToday: true });
    });

    it('keeps the streak alive when only yesterday is done', () => {
      const result = calculateStreak(['2026-11-17', '2026-11-18'], today);
      expect(result.current).toBe(2);
      expect(result.studiedToday).toBe(false);
    });

    it('resets to 0 after a missed day but keeps the longest run', () => {
      const result = calculateStreak(
        ['2026-11-10', '2026-11-11', '2026-11-12', '2026-11-16'],
        today,
      );
      expect(result.current).toBe(0);
      expect(result.longest).toBe(3);
    });

    it('does not count a gap as part of the current streak', () => {
      const result = calculateStreak(
        ['2026-11-15', '2026-11-18', '2026-11-19'],
        today,
      );
      expect(result.current).toBe(2);
    });
  });

  it('lists the last days oldest first with studied flags', () => {
    const days = lastDays(['2026-11-18', '2026-11-19'], '2026-11-19', 3);
    expect(days).toEqual([
      { date: '2026-11-17', studied: false },
      { date: '2026-11-18', studied: true },
      { date: '2026-11-19', studied: true },
    ]);
  });
});
