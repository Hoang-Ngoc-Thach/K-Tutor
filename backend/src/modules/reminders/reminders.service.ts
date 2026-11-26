import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { reminderEmail } from '../mail/mail-templates';
import { MailService } from '../mail/mail.service';
import { LearnedVocabulary } from '../study/entities/learned-vocabulary.entity';
import { StudyDay } from '../study/entities/study-day.entity';
import { STUDY_TIMEZONE } from '../study/streak';
import { User, UserRole } from '../users/entities/user.entity';
import { DAY_MS, decideReminder, ReminderConfig } from './reminder-rules';
import {
  createUnsubscribeToken,
  readUnsubscribeToken,
} from './unsubscribe-token';

// Learners are loaded in pages so memory stays small for many users.
const BATCH_SIZE = 200;

export interface ReminderRunResult {
  checked: number;
  sent: number;
  failed: number;
  skipped: number;
}

interface Activity {
  lastLearnedAt: Date | null;
  lastStudyDay: Date | null;
  learnedCount: number;
}

@Injectable()
export class RemindersService {
  private readonly logger = new Logger(RemindersService.name);

  constructor(
    @InjectRepository(User)
    private readonly usersRepo: Repository<User>,
    @InjectRepository(StudyDay)
    private readonly daysRepo: Repository<StudyDay>,
    @InjectRepository(LearnedVocabulary)
    private readonly learnedRepo: Repository<LearnedVocabulary>,
    private readonly mailService: MailService,
    private readonly config: ConfigService,
  ) {}

  private numberSetting(key: string, fallback: number): number {
    const value = Number(this.config.get(key));
    return Number.isFinite(value) && value > 0 ? value : fallback;
  }

  private get reminderConfig(): ReminderConfig {
    return {
      inactiveDays: this.numberSetting('REMINDER_INACTIVE_DAYS', 3),
      cooldownDays: this.numberSetting('REMINDER_COOLDOWN_DAYS', 7),
      maxInRow: this.numberSetting('REMINDER_MAX_IN_ROW', 3),
    };
  }

  private get unsubscribeSecret(): string {
    return `${this.config.getOrThrow<string>('JWT_SECRET')}:unsubscribe`;
  }

  // Every evening at 19:00 Vietnam time. Runs in this process, so run only
  // one instance of the backend (or move this to a separate worker).
  @Cron('0 19 * * *', { name: 'study-reminders', timeZone: STUDY_TIMEZONE })
  async handleDailyCron(): Promise<void> {
    if (this.config.get<string>('REMINDERS_ENABLED') === 'false') return;

    try {
      const result = await this.sendDueReminders();
      this.logger.log(
        `Study reminders: checked ${result.checked}, sent ${result.sent}, failed ${result.failed}`,
      );
    } catch (error) {
      this.logger.error(
        'Study reminder run failed',
        error instanceof Error ? error.stack : String(error),
      );
    }
  }

  // Emails every learner who is due a reminder. `now` is a parameter so tests
  // can run it at any date.
  async sendDueReminders(now: Date = new Date()): Promise<ReminderRunResult> {
    const settings = this.reminderConfig;
    const result: ReminderRunResult = {
      checked: 0,
      sent: 0,
      failed: 0,
      skipped: 0,
    };
    const frontendUrl = this.config.getOrThrow<string>('FRONTEND_URL');

    const inactiveCutoff = new Date(
      now.getTime() - settings.inactiveDays * DAY_MS,
    );
    const cooldownCutoff = new Date(
      now.getTime() - settings.cooldownDays * DAY_MS,
    );

    let afterId = '';
    for (;;) {
      // Cheap filters in SQL; the exact rules run in decideReminder().
      const users = await this.usersRepo
        .createQueryBuilder('user')
        .where('user.role = :role', { role: UserRole.LEARNER })
        .andWhere('user.locked = false')
        .andWhere('user.reminderEmails = true')
        .andWhere('user.emailVerifiedAt IS NOT NULL')
        .andWhere('user.createdAt <= :inactiveCutoff', { inactiveCutoff })
        .andWhere(
          '(user.lastReminderAt IS NULL OR user.lastReminderAt <= :cooldownCutoff)',
          { cooldownCutoff },
        )
        .andWhere('user.id > :afterId', { afterId })
        .orderBy('user.id', 'ASC')
        .take(BATCH_SIZE)
        .getMany();
      if (users.length === 0) break;

      const activity = await this.loadActivity(users.map((user) => user.id));

      for (const user of users) {
        result.checked += 1;
        const found = activity.get(user.id);

        const lastActivityAt = new Date(
          Math.max(
            user.createdAt.getTime(),
            found?.lastLearnedAt?.getTime() ?? 0,
            found?.lastStudyDay?.getTime() ?? 0,
          ),
        );

        const decision = decideReminder(
          {
            lastActivityAt,
            lastReminderAt: user.lastReminderAt,
            reminderCount: user.reminderCount,
          },
          now,
          settings,
        );
        if (!decision.send) {
          result.skipped += 1;
          continue;
        }

        const unsubscribeUrl = `${frontendUrl}/unsubscribe?token=${createUnsubscribeToken(user.id, this.unsubscribeSecret)}`;
        const mail = reminderEmail({
          name: this.displayName(user.email),
          daysInactive: decision.daysInactive,
          learnedCount: found?.learnedCount ?? 0,
          hasStudiedBefore: Boolean(found?.lastStudyDay || found?.learnedCount),
          appUrl: frontendUrl,
          unsubscribeUrl,
        });

        try {
          await this.mailService.send({
            to: user.email,
            ...mail,
            headers: { 'List-Unsubscribe': `<${unsubscribeUrl}>` },
          });
          await this.usersRepo.update(user.id, {
            lastReminderAt: now,
            reminderCount: decision.nextCount,
          });
          result.sent += 1;
        } catch (error) {
          // One bad address must not stop the other reminders.
          result.failed += 1;
          this.logger.error(
            `Could not send reminder to ${user.email}`,
            error instanceof Error ? error.stack : String(error),
          );
        }
      }

      afterId = users[users.length - 1].id;
    }

    return result;
  }

  // Turns the learner off for reminder emails (idempotent).
  async unsubscribe(token: string): Promise<{ unsubscribed: true }> {
    const userId = readUnsubscribeToken(token, this.unsubscribeSecret);
    if (!userId) {
      throw new BadRequestException('INVALID_UNSUBSCRIBE_TOKEN');
    }

    await this.usersRepo.update(userId, { reminderEmails: false });
    return { unsubscribed: true };
  }

  // The part of the email before @, capitalised ("hoc@x.com" -> "Hoc").
  private displayName(email: string): string {
    const local = email.split('@')[0];
    return local ? local.charAt(0).toUpperCase() + local.slice(1) : 'bạn';
  }

  // Latest study / learning activity and learned-word count per learner.
  private async loadActivity(
    userIds: string[],
  ): Promise<Map<string, Activity>> {
    const activity = new Map<string, Activity>();
    const entryFor = (userId: string): Activity => {
      let entry = activity.get(userId);
      if (!entry) {
        entry = { lastLearnedAt: null, lastStudyDay: null, learnedCount: 0 };
        activity.set(userId, entry);
      }
      return entry;
    };

    const days = await this.daysRepo
      .createQueryBuilder('day')
      .select('day.userId', 'userId')
      .addSelect('MAX(day.date)', 'lastDate')
      .where('day.userId IN (:...userIds)', { userIds })
      .groupBy('day.userId')
      .getRawMany<{ userId: string; lastDate: string }>();
    for (const row of days) {
      // Study days are calendar days in Vietnam time; count them as noon.
      entryFor(row.userId).lastStudyDay = new Date(
        `${row.lastDate}T12:00:00+07:00`,
      );
    }

    const learned = await this.learnedRepo
      .createQueryBuilder('learned')
      .select('learned.userId', 'userId')
      .addSelect(
        'MAX(GREATEST(learned.learnedAt, COALESCE(learned.lastReviewedAt, learned.learnedAt)))',
        'lastAt',
      )
      .addSelect('COUNT(*)', 'count')
      .where('learned.userId IN (:...userIds)', { userIds })
      .groupBy('learned.userId')
      .getRawMany<{ userId: string; lastAt: Date | string; count: string }>();
    for (const row of learned) {
      const entry = entryFor(row.userId);
      entry.lastLearnedAt = new Date(row.lastAt);
      entry.learnedCount = Number(row.count);
    }

    return activity;
  }
}
