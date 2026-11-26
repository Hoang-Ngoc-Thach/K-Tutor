import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createTransport, Transporter } from 'nodemailer';

export interface MailMessage {
  to: string;
  subject: string;
  text: string;
  html: string;
  headers?: Record<string, string>;
}

// Sends email through SMTP (MAIL_* variables in .env).
// Without MAIL_HOST, in development, emails are only written to the log so
// the app still works locally. In production a missing MAIL_HOST is an error.
@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly transporter: Transporter;
  private readonly from: string;
  private readonly smtpConfigured: boolean;
  private readonly isProduction: boolean;

  constructor(config: ConfigService) {
    const host = config.get<string>('MAIL_HOST');
    this.smtpConfigured = Boolean(host);
    this.isProduction = config.get<string>('NODE_ENV') === 'production';
    this.from =
      config.get<string>('MAIL_FROM') ?? 'K-Tutor <no-reply@ktutor.local>';

    if (host) {
      const port = Number(config.get<string>('MAIL_PORT') ?? 587);
      const user = config.get<string>('MAIL_USER');
      this.transporter = createTransport({
        host,
        port,
        // 465 uses TLS from the start; 587 upgrades with STARTTLS.
        secure: config.get<string>('MAIL_SECURE') === 'true' || port === 465,
        auth: user
          ? { user, pass: config.get<string>('MAIL_PASSWORD') }
          : undefined,
      });
    } else {
      this.transporter = createTransport({ jsonTransport: true });
      if (!this.isProduction) {
        this.logger.warn(
          'MAIL_HOST is not set: emails are only written to the log.',
        );
      }
    }
  }

  async send(message: MailMessage): Promise<void> {
    if (!this.smtpConfigured && this.isProduction) {
      // Never log message bodies in production: they contain secret links.
      throw new Error('MAIL_HOST is not configured');
    }

    await this.transporter.sendMail({ from: this.from, ...message });

    if (!this.smtpConfigured) {
      this.logger.log(
        `[DEV MAIL] to=${message.to} subject="${message.subject}"\n${message.text}`,
      );
    }
  }
}
