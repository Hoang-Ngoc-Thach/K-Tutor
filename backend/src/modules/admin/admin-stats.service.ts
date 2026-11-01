import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ExampleSentence } from '../learning/entities/example-sentence.entity';
import { Grammar } from '../learning/entities/grammar.entity';
import { Level } from '../learning/entities/level.entity';
import { Topic } from '../learning/entities/topic.entity';
import { Vocabulary } from '../learning/entities/vocabulary.entity';
import { LearningGoal, User, UserRole } from '../users/entities/user.entity';

@Injectable()
export class AdminStatsService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepo: Repository<User>,
    @InjectRepository(Level)
    private readonly levelsRepo: Repository<Level>,
    @InjectRepository(Topic)
    private readonly topicsRepo: Repository<Topic>,
    @InjectRepository(Vocabulary)
    private readonly vocabulariesRepo: Repository<Vocabulary>,
    @InjectRepository(Grammar)
    private readonly grammarsRepo: Repository<Grammar>,
    @InjectRepository(ExampleSentence)
    private readonly examplesRepo: Repository<ExampleSentence>,
  ) {}

  async getStats() {
    const [
      totalUsers,
      conversation,
      topik,
      totalTopics,
      totalVocabularies,
      totalGrammars,
      topicsByLevelRaw,
      withExamplesRaw,
    ] = await Promise.all([
      this.usersRepo.count({ where: { role: UserRole.LEARNER } }),
      this.usersRepo.count({
        where: { role: UserRole.LEARNER, goal: LearningGoal.CONVERSATION },
      }),
      this.usersRepo.count({
        where: { role: UserRole.LEARNER, goal: LearningGoal.TOPIK },
      }),
      this.topicsRepo.count(),
      this.vocabulariesRepo.count(),
      this.grammarsRepo.count(),
      this.levelsRepo
        .createQueryBuilder('level')
        .leftJoin('level.topics', 'topic')
        .select('level.id', 'levelId')
        .addSelect('level.name', 'name')
        .addSelect('COUNT(topic.id)', 'count')
        .groupBy('level.id')
        .addGroupBy('level.name')
        .addGroupBy('level.sortOrder')
        .orderBy('level.sortOrder', 'ASC')
        .getRawMany<{ levelId: string; name: string; count: string }>(),
      this.examplesRepo
        .createQueryBuilder('example')
        .select('COUNT(DISTINCT example.vocabularyId)', 'count')
        .where('example.vocabularyId IS NOT NULL')
        .getRawOne<{ count: string }>(),
    ]);

    return {
      totalUsers,
      byGoal: { conversation, topik },
      totalTopics,
      topicsByLevel: topicsByLevelRaw.map((row) => ({
        levelId: row.levelId,
        name: row.name,
        count: Number(row.count),
      })),
      totalVocabularies,
      totalGrammars,
      vocabulariesWithExamples: Number(withExamplesRaw?.count ?? 0),
    };
  }
}
