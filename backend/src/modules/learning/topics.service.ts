import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateTopicDto } from './dto/create-topic.dto';
import { UpdateTopicDto } from './dto/update-topic.dto';
import { Grammar } from './entities/grammar.entity';
import { Level } from './entities/level.entity';
import { Topic } from './entities/topic.entity';
import { Vocabulary } from './entities/vocabulary.entity';

@Injectable()
export class TopicsService {
  constructor(
    @InjectRepository(Topic)
    private readonly topicsRepo: Repository<Topic>,
    @InjectRepository(Vocabulary)
    private readonly vocabulariesRepo: Repository<Vocabulary>,
    @InjectRepository(Grammar)
    private readonly grammarsRepo: Repository<Grammar>,
    @InjectRepository(Level)
    private readonly levelsRepo: Repository<Level>,
  ) {}

  async findAll(
    levelId: string,
  ): Promise<(Topic & { vocabularyCount: number; grammarCount: number })[]> {
    const topics = await this.topicsRepo.find({
      where: { levelId },
      order: { sortOrder: 'ASC', createdAt: 'ASC' },
    });

    if (topics.length === 0) {
      return [];
    }

    const topicIds = topics.map((topic) => topic.id);
    const [vocabularyCounts, grammarCounts] = await Promise.all([
      this.countByTopic(this.vocabulariesRepo, 'vocabulary', topicIds),
      this.countByTopic(this.grammarsRepo, 'grammar', topicIds),
    ]);

    return topics.map((topic) => ({
      ...topic,
      vocabularyCount: vocabularyCounts.get(topic.id) ?? 0,
      grammarCount: grammarCounts.get(topic.id) ?? 0,
    }));
  }

  async findOne(id: string): Promise<Topic> {
    const topic = await this.topicsRepo.findOne({ where: { id } });
    if (!topic) {
      throw new NotFoundException('TOPIC_NOT_FOUND');
    }
    return topic;
  }

  async create(dto: CreateTopicDto): Promise<Topic> {
    await this.assertLevelExists(dto.levelId);
    await this.assertNameAvailable(dto.name, dto.levelId);

    const topic = this.topicsRepo.create({
      name: dto.name,
      description: dto.description ?? null,
      sortOrder: dto.sortOrder ?? 0,
      levelId: dto.levelId,
    });
    return this.topicsRepo.save(topic);
  }

  async update(id: string, dto: UpdateTopicDto): Promise<Topic> {
    const topic = await this.findOne(id);
    const levelId = dto.levelId ?? topic.levelId;

    if (dto.levelId !== undefined) {
      await this.assertLevelExists(dto.levelId);
    }
    await this.assertNameAvailable(dto.name ?? topic.name, levelId, id);

    if (dto.name !== undefined) {
      topic.name = dto.name;
    }
    if (dto.description !== undefined) {
      topic.description = dto.description;
    }
    if (dto.sortOrder !== undefined) {
      topic.sortOrder = dto.sortOrder;
    }
    if (dto.levelId !== undefined) {
      topic.levelId = dto.levelId;
    }

    return this.topicsRepo.save(topic);
  }

  async remove(id: string): Promise<{ id: string }> {
    const topic = await this.findOne(id);
    await this.topicsRepo.remove(topic);
    return { id };
  }

  private async assertLevelExists(levelId: string): Promise<void> {
    const level = await this.levelsRepo.findOne({ where: { id: levelId } });
    if (!level) {
      throw new NotFoundException('LEVEL_NOT_FOUND');
    }
  }

  private async assertNameAvailable(
    name: string,
    levelId: string,
    ignoreId?: string,
  ): Promise<void> {
    const existing = await this.topicsRepo.findOne({
      where: { name, levelId },
    });
    if (existing && existing.id !== ignoreId) {
      throw new ConflictException('TOPIC_NAME_EXISTS');
    }
  }

  private async countByTopic(
    repository: Repository<Vocabulary | Grammar>,
    alias: string,
    topicIds: string[],
  ): Promise<Map<string, number>> {
    const rows = await repository
      .createQueryBuilder(alias)
      .select(`${alias}.topicId`, 'topicId')
      .addSelect('COUNT(*)', 'count')
      .where(`${alias}.topicId IN (:...topicIds)`, { topicIds })
      .groupBy(`${alias}.topicId`)
      .getRawMany<{ topicId: string; count: string | number }>();

    return new Map(rows.map((row) => [row.topicId, Number(row.count)]));
  }
}
