import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateGrammarDto } from './dto/create-grammar.dto';
import { UpdateGrammarDto } from './dto/update-grammar.dto';
import { Grammar } from './entities/grammar.entity';
import { Topic } from './entities/topic.entity';

@Injectable()
export class GrammarsService {
  constructor(
    @InjectRepository(Grammar)
    private readonly grammarsRepo: Repository<Grammar>,
    @InjectRepository(Topic)
    private readonly topicsRepo: Repository<Topic>,
  ) {}

  async findOne(id: string): Promise<Grammar> {
    const grammar = await this.grammarsRepo.findOne({ where: { id } });
    if (!grammar) {
      throw new NotFoundException('GRAMMAR_NOT_FOUND');
    }
    return grammar;
  }

  async create(dto: CreateGrammarDto): Promise<Grammar> {
    await this.assertTopicExists(dto.topicId);

    const grammar = this.grammarsRepo.create({
      title: dto.title,
      content: dto.content,
      sortOrder: dto.sortOrder ?? 0,
      topicId: dto.topicId,
    });
    return this.grammarsRepo.save(grammar);
  }

  async update(id: string, dto: UpdateGrammarDto): Promise<Grammar> {
    const grammar = await this.findOne(id);

    if (dto.topicId !== undefined) {
      await this.assertTopicExists(dto.topicId);
      grammar.topicId = dto.topicId;
    }
    if (dto.title !== undefined) {
      grammar.title = dto.title;
    }
    if (dto.content !== undefined) {
      grammar.content = dto.content;
    }
    if (dto.sortOrder !== undefined) {
      grammar.sortOrder = dto.sortOrder;
    }

    return this.grammarsRepo.save(grammar);
  }

  async remove(id: string): Promise<{ id: string }> {
    const grammar = await this.findOne(id);
    await this.grammarsRepo.remove(grammar);
    return { id };
  }

  private async assertTopicExists(topicId: string): Promise<void> {
    const topic = await this.topicsRepo.findOne({ where: { id: topicId } });
    if (!topic) {
      throw new NotFoundException('TOPIC_NOT_FOUND');
    }
  }
}
