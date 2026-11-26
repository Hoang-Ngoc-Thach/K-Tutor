import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { createHash, randomBytes } from 'crypto';
import { Repository } from 'typeorm';
import { verificationEmail } from '../mail/mail-templates';
import { MailService } from '../mail/mail.service';
import { User } from '../users/entities/user.entity';
import { EmailVerificationToken } from './entities/email-verification-token.entity';

const HOUR_MS = 60 * 60 * 1000;
// Asking for another email within this time is ignored (anti-spam).
const RESEND_COOLDOWN_MS = 60 * 1000;
const DEFAULT_TTL_HOURS = 24;

export function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

@Injectable()
export class EmailVerificationService {
  private readonly logger = new Logger(EmailVerificationService.name);

  constructor(
    @InjectRepository(EmailVerificationToken)
    private readonly tokensRepo: Repository<EmailVerificationToken>,
    @InjectRepository(User)
    private readonly usersRepo: Repository<User>,
    private readonly mailService: MailService,
    private readonly config: ConfigService,
  ) {}

  private get ttlHours(): number {
    const value = Number(this.config.get('EMAIL_VERIFICATION_TTL_HOURS'));
    return value > 0 ? value : DEFAULT_TTL_HOURS;
  }

  // Replaces any older link with a new one and emails it.
  // Returns false (instead of throwing) when the email could not be sent, so
  // registration still succeeds and the learner can ask for another email.
  async sendFor(user: User): Promise<boolean> {
    await this.tokensRepo.delete({ userId: user.id });

    const token = randomBytes(32).toString('hex');
    await this.tokensRepo.save(
      this.tokensRepo.create({
        userId: user.id,
        tokenHash: hashToken(token),
        expiresAt: new Date(Date.now() + this.ttlHours * HOUR_MS),
      }),
    );

    const frontendUrl = this.config.getOrThrow<string>('FRONTEND_URL');
    const mail = verificationEmail({
      link: `${frontendUrl}/verify-email?token=${token}`,
      ttlHours: this.ttlHours,
    });

    try {
      await this.mailService.send({ to: user.email, ...mail });
      return true;
    } catch (error) {
      this.logger.error(
        `Could not send verification email to ${user.email}`,
        error instanceof Error ? error.stack : String(error),
      );
      return false;
    }
  }

  // The link is opened by a POST from the web app (not a GET), so mail
  // scanners that pre-open links cannot use up the token.
  async verify(token: string): Promise<{ email: string }> {
    const record = await this.tokensRepo.findOne({
      where: { tokenHash: hashToken(token) },
    });
    if (!record || record.expiresAt.getTime() < Date.now()) {
      throw new BadRequestException('INVALID_OR_EXPIRED_TOKEN');
    }

    const user = await this.usersRepo.findOne({ where: { id: record.userId } });
    if (!user) {
      throw new BadRequestException('INVALID_OR_EXPIRED_TOKEN');
    }

    await this.usersRepo.manager.transaction(async (manager) => {
      if (!user.emailVerifiedAt) {
        await manager.update(User, user.id, { emailVerifiedAt: new Date() });
      }
      await manager.delete(EmailVerificationToken, { userId: user.id });
    });

    return { email: user.email };
  }

  // Never reveals whether the email exists or is already verified: the caller
  // always gets the same answer.
  async resend(email: string): Promise<void> {
    const user = await this.usersRepo.findOne({ where: { email } });
    if (!user || user.emailVerifiedAt) return;

    const latest = await this.tokensRepo.findOne({
      where: { userId: user.id },
      order: { createdAt: 'DESC' },
    });
    if (
      latest &&
      Date.now() - latest.createdAt.getTime() < RESEND_COOLDOWN_MS
    ) {
      return;
    }

    await this.sendFor(user);
  }
}
