import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateVocabularyDto } from './dto/create-vocabulary.dto';
import { UpdateVocabularyDto } from './dto/update-vocabulary.dto';
import { Topic } from './entities/topic.entity';
import { Vocabulary } from './entities/vocabulary.entity';
import {
  ImportColumn,
  ImportRowError,
  readExcelRows,
  throwIfInvalid,
  validateRow,
} from './excel/excel-import.util';

const VOCABULARY_COLUMNS: ImportColumn[] = [
  {
    field: 'korean',
    aliases: ['từ tiếng hàn', 'từ vựng', 'tiếng hàn', 'korean'],
    required: true,
    maxLength: 255,
  },
  {
    field: 'pronunciation',
    aliases: ['phát âm', 'pronunciation'],
    required: false,
    maxLength: 255,
  },
  {
    field: 'meaning',
    aliases: ['nghĩa tiếng việt', 'nghĩa', 'meaning'],
    required: true,
    maxLength: 500,
  },
];

const duplicateKey = (korean: string, meaning: string) =>
  `${korean.toLowerCase()}|${meaning.toLowerCase()}`;

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

  // Thêm hàng loạt từ file Excel vào một chủ đề. Nếu có dòng lỗi thì không
  // thêm dòng nào; nếu hợp lệ thì thêm tất cả trong một transaction.
  async importFromExcel(
    topicId: string,
    buffer: Buffer,
  ): Promise<{ imported: number }> {
    await this.assertTopicExists(topicId);

    const rows = await readExcelRows(buffer, VOCABULARY_COLUMNS);

    const existing = await this.vocabulariesRepo.find({
      where: { topicId },
      select: { korean: true, meaning: true },
    });
    const existingKeys = new Set(
      existing.map((item) => duplicateKey(item.korean, item.meaning)),
    );
    const seenInFile = new Set<string>();

    const errors: ImportRowError[] = [];
    const validRows: typeof rows = [];
    for (const row of rows) {
      const before = errors.length;
      validateRow(row, VOCABULARY_COLUMNS, errors);
      if (errors.length > before) {
        continue;
      }

      const key = duplicateKey(row.values.korean, row.values.meaning);
      if (existingKeys.has(key)) {
        errors.push({
          row: row.row,
          field: 'korean',
          code: 'DUPLICATE_EXISTING',
        });
        continue;
      }
      if (seenInFile.has(key)) {
        errors.push({
          row: row.row,
          field: 'korean',
          code: 'DUPLICATE_IN_FILE',
        });
        continue;
      }
      seenInFile.add(key);
      validRows.push(row);
    }
    throwIfInvalid(errors);

    const raw = await this.vocabulariesRepo
      .createQueryBuilder('vocabulary')
      .select('MAX(vocabulary.sortOrder)', 'max')
      .where('vocabulary.topicId = :topicId', { topicId })
      .getRawOne<{ max: string | number | null }>();
    const start =
      raw?.max === null || raw?.max === undefined ? 0 : Number(raw.max) + 1;

    const entities = validRows.map((row, index) =>
      this.vocabulariesRepo.create({
        korean: row.values.korean,
        meaning: row.values.meaning,
        pronunciation: row.values.pronunciation || null,
        sortOrder: start + index,
        topicId,
      }),
    );
    await this.vocabulariesRepo.manager.transaction((manager) =>
      manager.save(entities, { chunk: 100 }),
    );

    return { imported: entities.length };
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
