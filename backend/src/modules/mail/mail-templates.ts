// Email content (Vietnamese). Each builder returns a plain-text and an HTML
// version; every dynamic value placed in HTML is escaped.

export interface MailContent {
  subject: string;
  text: string;
  html: string;
}

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// Minimal layout shared by all emails: a card with one call-to-action button.
function layout(options: {
  heading: string;
  paragraphs: string[]; // plain text, escaped here
  buttonLabel: string;
  buttonUrl: string;
  footer: string; // already-safe HTML
}): string {
  const paragraphs = options.paragraphs
    .map(
      (paragraph) =>
        `<p style="margin:0 0 14px;font-size:15px;line-height:1.6;color:#374151;">${escapeHtml(paragraph)}</p>`,
    )
    .join('');

  return `<!doctype html>
<html lang="vi">
  <body style="margin:0;padding:24px;background:#f3f4f6;font-family:Arial,Helvetica,sans-serif;">
    <div style="max-width:520px;margin:0 auto;background:#ffffff;border-radius:16px;padding:32px;">
      <p style="margin:0 0 20px;font-size:18px;font-weight:bold;color:#047857;">K-Tutor</p>
      <h1 style="margin:0 0 16px;font-size:20px;color:#111827;">${escapeHtml(options.heading)}</h1>
      ${paragraphs}
      <p style="margin:24px 0;">
        <a href="${escapeHtml(options.buttonUrl)}" style="display:inline-block;background:#047857;color:#ffffff;text-decoration:none;font-weight:bold;font-size:15px;padding:12px 24px;border-radius:10px;">${escapeHtml(options.buttonLabel)}</a>
      </p>
      <p style="margin:0 0 6px;font-size:12px;color:#6b7280;">Nếu nút không bấm được, hãy sao chép liên kết này vào trình duyệt:</p>
      <p style="margin:0 0 20px;font-size:12px;color:#6b7280;word-break:break-all;">${escapeHtml(options.buttonUrl)}</p>
      <p style="margin:0;font-size:12px;line-height:1.5;color:#9ca3af;">${options.footer}</p>
    </div>
  </body>
</html>`;
}

export function verificationEmail(input: {
  link: string;
  ttlHours: number;
}): MailContent {
  const intro =
    'Cảm ơn bạn đã đăng ký K-Tutor. Bấm nút bên dưới để xác nhận địa chỉ email và bắt đầu học.';
  const expiry = `Liên kết có hiệu lực trong ${input.ttlHours} giờ và chỉ dùng được một lần.`;
  const ignore = 'Nếu bạn không đăng ký tài khoản này, hãy bỏ qua email này.';

  return {
    subject: 'Xác nhận email đăng ký K-Tutor',
    text: ['Chào bạn,', '', intro, input.link, '', expiry, ignore].join('\n'),
    html: layout({
      heading: 'Xác nhận email của bạn',
      paragraphs: [intro, expiry],
      buttonLabel: 'Xác nhận email',
      buttonUrl: input.link,
      footer: escapeHtml(ignore),
    }),
  };
}

export interface ReminderContext {
  name: string;
  daysInactive: number;
  learnedCount: number;
  hasStudiedBefore: boolean;
  appUrl: string; // frontend origin, no trailing slash
  unsubscribeUrl: string;
}

// Enough learned words to run the streak review (same rule as the app).
const MIN_WORDS_FOR_REVIEW = 4;

export function reminderEmail(context: ReminderContext): MailContent {
  const canReview = context.learnedCount >= MIN_WORDS_FOR_REVIEW;
  const buttonUrl = canReview
    ? `${context.appUrl}/streak`
    : `${context.appUrl}/topics`;
  const buttonLabel = canReview ? 'Ôn tập 5 phút' : 'Chọn chủ đề để học';

  const subject = context.hasStudiedBefore
    ? `${context.name} ơi, bạn đã ${context.daysInactive} ngày chưa học tiếng Hàn`
    : 'Bắt đầu học tiếng Hàn cùng K-Tutor nhé';

  const lead = context.hasStudiedBefore
    ? `Đã ${context.daysInactive} ngày bạn chưa quay lại K-Tutor. Học đều mỗi ngày giúp bạn nhớ từ lâu hơn.`
    : 'Bạn đã có tài khoản K-Tutor nhưng chưa bắt đầu học. Chỉ cần vài phút mỗi ngày là đủ.';
  const suggestion = canReview
    ? `Bạn có ${context.learnedCount} từ đã học đang chờ ôn tập. Một phiên ôn tập chỉ mất khoảng 5 phút và giúp bắt đầu lại chuỗi ngày học.`
    : 'Hãy chọn một chủ đề, học bằng flashcard và bấm "Đã nhớ" ở các từ bạn thuộc để mở khóa ôn tập mỗi ngày.';

  return {
    subject,
    text: [
      `Chào ${context.name},`,
      '',
      lead,
      suggestion,
      '',
      `${buttonLabel}: ${buttonUrl}`,
      '',
      `Không muốn nhận email nhắc học nữa? Hủy tại: ${context.unsubscribeUrl}`,
    ].join('\n'),
    html: layout({
      heading: `Chào ${context.name},`,
      paragraphs: [lead, suggestion],
      buttonLabel,
      buttonUrl,
      footer: `Không muốn nhận email nhắc học nữa? <a href="${escapeHtml(context.unsubscribeUrl)}" style="color:#6b7280;">Hủy nhận email nhắc học</a>.`,
    }),
  };
}
