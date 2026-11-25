import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, QueryFailedError, Repository } from 'typeorm';
import { Vocabulary } from '../learning/entities/vocabulary.entity';
import { CompleteDailyReviewDto } from './dto/complete-daily-review.dto';
import { SetLearnedDto } from './dto/set-learned.dto';
import { LearnedVocabulary } from './entities/learned-vocabulary.entity';
import { StudyDay } from './entities/study-day.entity';
import { calculateStreak, lastDays, toDateString } from './streak';

// The 4 review games, in the same order as the frontend's game list.
export const DAILY_GAMES = ['choice', 'builder', 'memory', 'typing'] as const;
export type DailyGame = (typeof DAILY_GAMES)[number];

// A daily review needs enough learned words to build 4 different games.
export const MIN_LEARNED_WORDS = 4;
// Words per game stage, and extra words used as wrong answers.
export const WORDS_PER_STAGE = 5;
export const POOL_SIZE = 30;

export type ReviewWord = Pick<
  Vocabulary,
  'id' | 'korean' | 'meaning' | 'pronunciation' | 'topicId'
>;

function shuffle<T>(items: T[]): T[] {
  const result = [...items];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
  }
  return result;
}

@Injectable()
export class StudyService {
  constructor(
    @InjectRepository(LearnedVocabulary)
    private readonly learnedRepo: Repository<LearnedVocabulary>,
    @InjectRepository(StudyDay)
    private readonly daysRepo: Repository<StudyDay>,
    @InjectRepository(Vocabulary)
    private readonly vocabRepo: Repository<Vocabulary>,
  ) {}

  // ---- Learned words ----

  async findLearned(userId: string, topicId?: string) {
    const query = this.learnedRepo
      .createQueryBuilder('learned')
      .innerJoin('learned.vocabulary', 'vocabulary')
      .select('learned.vocabularyId', 'vocabularyId')
      .addSelect('vocabulary.topicId', 'topicId')
      .where('learned.userId = :userId', { userId });
    if (topicId) {
      query.andWhere('vocabulary.topicId = :topicId', { topicId });
    }

    const items = await query.getRawMany<{
      vocabularyId: string;
      topicId: string;
    }>();
    return { count: items.length, items };
  }

  // Marks (or un-marks) words as learned. Safe to call repeatedly.
  async setLearned(userId: string, dto: SetLearnedDto) {
    const ids = [...new Set(dto.vocabularyIds)];

    const found = await this.vocabRepo.count({ where: { id: In(ids) } });
    if (found !== ids.length) {
      throw new NotFoundException('VOCABULARY_NOT_FOUND');
    }

    if (dto.learned) {
      const existing = await this.learnedRepo.find({
        where: { userId, vocabularyId: In(ids) },
        select: { vocabularyId: true },
      });
      const have = new Set(existing.map((row) => row.vocabularyId));
      const toAdd = ids.filter((id) => !have.has(id));

      if (toAdd.length > 0) {
        try {
          await this.learnedRepo.save(
            toAdd.map((vocabularyId) =>
              this.learnedRepo.create({ userId, vocabularyId }),
            ),
          );
        } catch (error) {
          // Two quick clicks can race; the word is already saved then.
          const isDuplicate =
            error instanceof QueryFailedError &&
            (error.driverError as { code?: string })?.code === 'ER_DUP_ENTRY';
          if (!isDuplicate) throw error;
        }
      }
    } else {
      await this.learnedRepo.delete({ userId, vocabularyId: In(ids) });
    }

    return {
      learnedCount: await this.learnedRepo.count({ where: { userId } }),
    };
  }

  // ---- Streak ----

  async getStreak(userId: string) {
    const days = await this.daysRepo.find({
      where: { userId },
      select: { date: true },
    });
    const dates = days.map((day) => day.date);
    const today = toDateString(new Date());

    return {
      today,
      ...calculateStreak(dates, today),
      last7Days: lastDays(dates, today, 7),
      learnedCount: await this.learnedRepo.count({ where: { userId } }),
      minWords: MIN_LEARNED_WORDS,
    };
  }

  // ---- Daily review ----

  // Builds today's review: the 4 games in random order, each with random
  // words picked from the words the learner has marked as learned.
  async getDailyReview(userId: string) {
    const learned = await this.learnedRepo.find({
      where: { userId },
      select: { vocabularyId: true },
    });
    if (learned.length < MIN_LEARNED_WORDS) {
      throw new BadRequestException('NOT_ENOUGH_LEARNED_WORDS');
    }

    const pickedIds = shuffle(learned.map((row) => row.vocabularyId)).slice(
      0,
      POOL_SIZE,
    );
    const pool: ReviewWord[] = await this.vocabRepo.find({
      where: { id: In(pickedIds) },
      select: {
        id: true,
        korean: true,
        meaning: true,
        pronunciation: true,
        topicId: true,
      },
    });

    const stages = shuffle([...DAILY_GAMES]).map((game) => ({
      game,
      words: shuffle(pool).slice(0, Math.min(WORDS_PER_STAGE, pool.length)),
    }));

    return { date: toDateString(new Date()), stages, pool };
  }

  // Called when the learner has finished all stages. Records the results on
  // each word and counts today toward the streak.
  async completeDailyReview(userId: string, dto: CompleteDailyReviewDto) {
    const tally = new Map<string, { correct: number; wrong: number }>();
    for (const result of dto.results) {
      const entry = tally.get(result.vocabularyId) ?? { correct: 0, wrong: 0 };
      if (result.correct) entry.correct += 1;
      else entry.wrong += 1;
      tally.set(result.vocabularyId, entry);
    }

    const rows = await this.learnedRepo.find({
      where: { userId, vocabularyId: In([...tally.keys()]) },
    });
    // Only words the learner has marked as learned can be reviewed.
    if (rows.length !== tally.size) {
      throw new BadRequestException('INVALID_REVIEW_WORDS');
    }

    const today = toDateString(new Date());
    const correctTotal = dto.results.filter((result) => result.correct).length;

    const firstTimeToday = await this.learnedRepo.manager.transaction(
      async (manager) => {
        const now = new Date();
        for (const row of rows) {
          const entry = tally.get(row.vocabularyId)!;
          row.correctCount += entry.correct;
          row.wrongCount += entry.wrong;
          row.lastReviewedAt = now;
        }
        await manager.save(LearnedVocabulary, rows);

        let day = await manager.findOne(StudyDay, {
          where: { userId, date: today },
        });
        const isFirst = !day;
        day ??= manager.create(StudyDay, {
          userId,
          date: today,
          sessions: 0,
          wordsReviewed: 0,
          correctCount: 0,
        });
        day.sessions += 1;
        day.wordsReviewed += dto.results.length;
        day.correctCount += correctTotal;
        await manager.save(StudyDay, day);

        return isFirst;
      },
    );

    return {
      ...(await this.getStreak(userId)),
      streakIncreased: firstTimeToday,
      session: { total: dto.results.length, correct: correctTotal },
    };
  }
}
