import { escapeHtml, reminderEmail, verificationEmail } from './mail-templates';

describe('mail templates', () => {
  it('escapes HTML special characters', () => {
    expect(escapeHtml(`<a href="x">&'</a>`)).toBe(
      '&lt;a href=&quot;x&quot;&gt;&amp;&#39;&lt;/a&gt;',
    );
  });

  describe('verificationEmail', () => {
    const mail = verificationEmail({
      link: 'http://localhost:5173/verify-email?token=abc',
      ttlHours: 24,
    });

    it('puts the link and the expiry in both versions', () => {
      expect(mail.text).toContain('verify-email?token=abc');
      expect(mail.html).toContain(
        'href="http://localhost:5173/verify-email?token=abc"',
      );
      expect(mail.text).toContain('24 giờ');
    });
  });

  describe('reminderEmail', () => {
    const base = {
      name: 'Hoc',
      daysInactive: 5,
      appUrl: 'http://localhost:5173',
      unsubscribeUrl: 'http://localhost:5173/unsubscribe?token=t',
    };

    it('sends learners with enough words to the streak review', () => {
      const mail = reminderEmail({
        ...base,
        learnedCount: 12,
        hasStudiedBefore: true,
      });
      expect(mail.subject).toContain('5 ngày');
      expect(mail.text).toContain('http://localhost:5173/streak');
      expect(mail.text).toContain('12 từ');
    });

    it('sends learners with few words to pick a topic', () => {
      const mail = reminderEmail({
        ...base,
        learnedCount: 2,
        hasStudiedBefore: true,
      });
      expect(mail.text).toContain('http://localhost:5173/topics');
      expect(mail.text).not.toContain('/streak');
    });

    it('welcomes learners who never studied instead of counting days', () => {
      const mail = reminderEmail({
        ...base,
        learnedCount: 0,
        hasStudiedBefore: false,
      });
      expect(mail.subject).not.toContain('ngày chưa học');
    });

    it('always includes the unsubscribe link', () => {
      const mail = reminderEmail({
        ...base,
        learnedCount: 0,
        hasStudiedBefore: false,
      });
      expect(mail.text).toContain('unsubscribe?token=t');
      expect(mail.html).toContain('unsubscribe?token=t');
    });

    it('escapes the learner name in the HTML version', () => {
      const mail = reminderEmail({
        ...base,
        name: '<script>x</script>',
        learnedCount: 0,
        hasStudiedBefore: false,
      });
      expect(mail.html).not.toContain('<script>');
      expect(mail.html).toContain('&lt;script&gt;');
    });
  });
});
