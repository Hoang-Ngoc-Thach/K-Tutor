import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateVocabularyDto } from './dto/create-vocabulary.dto';
import { UpdateVocabularyDto } from './dto/update-vocabulary.dto';
import { Topic } from './entities/topic.entity';
import { Vocabulary } from './entities/vocabulary.entity';

@Injectable()
export class VocabulariesService {
  constructor(
    @InjectRepository(Vocabulary)
    private readonly vocabulariesRepo: Repository<Vocabulary>,
    @InjectRepository(Topic)
    private readonly topicsRepo: Repository<Topic>,
  ) {}

  async findOne(id: string): Promise<Vocabulary> {
    const vocabulary = await this.vocabulariesRepo.findOne({ where: { id } });
    if (!vocabulary) {
      throw new NotFoundException('VOCABULARY_NOT_FOUND');
    }
    return vocabulary;
  }

  async create(dto: CreateVocabularyDto): Promise<Vocabulary> {
    await this.assertTopicExists(dto.topicId);

    const vocabulary = this.vocabulariesRepo.create({
      korean: dto.korean,
      meaning: dto.meaning,
      pronunciation: dto.pronunciation || null,
      sortOrder: dto.sortOrder ?? 0,
      topicId: dto.topicId,
    });
    return this.vocabulariesRepo.save(vocabulary);
  }

  async update(id: string, dto: UpdateVocabularyDto): Promise<Vocabulary> {
    const vocabulary = await this.findOne(id);

    if (dto.topicId !== undefined) {
      await this.assertTopicExists(dto.topicId);
      vocabulary.topicId = dto.topicId;
    }
    if (dto.korean !== undefined) {
      vocabulary.korean = dto.korean;
    }
    if (dto.meaning !== undefined) {
      vocabulary.meaning = dto.meaning;
    }
    if (dto.pronunciation !== undefined) {
      vocabulary.pronunciation = dto.pronunciation || null;
    }
    if (dto.sortOrder !== undefined) {
      vocabulary.sortOrder = dto.sortOrder;
    }

    return this.vocabulariesRepo.save(vocabulary);
  }

  async remove(id: string): Promise<{ id: string }> {
    const vocabulary = await this.findOne(id);
    await this.vocabulariesRepo.remove(vocabulary);
    return { id };
  }

  private async assertTopicExists(topicId: string): Promise<void> {
    const topic = await this.topicsRepo.findOne({ where: { id: topicId } });
    if (!topic) {
      throw new NotFoundException('TOPIC_NOT_FOUND');
    }
  }
}
