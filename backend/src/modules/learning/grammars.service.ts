import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateGrammarDto } from './dto/create-grammar.dto';
import { UpdateGrammarDto } from './dto/update-grammar.dto';
import { Grammar } from './entities/grammar.entity';
import { Topic } from './entities/topic.entity';
import {
  ImportColumn,
  ImportRowError,
  readExcelRows,
  throwIfInvalid,
  validateRow,
} from './excel/excel-import.util';

const GRAMMAR_COLUMNS: ImportColumn[] = [
  {
    field: 'title',
    aliases: ['ngữ pháp', 'cấu trúc', 'title'],
    required: true,
    maxLength: 255,
  },
  {
    field: 'content',
    aliases: ['giải thích', 'giải thích tiếng việt', 'nội dung', 'content'],
    required: true,
    maxLength: 20000,
  },
];

const duplicateKey = (title: string, content: string) =>
  `${title.toLowerCase()}|${content.toLowerCase()}`;

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

  // Thêm hàng loạt từ file Excel vào một chủ đề. Nếu có dòng lỗi thì không
  // thêm dòng nào; nếu hợp lệ thì thêm tất cả trong một transaction.
  async importFromExcel(
    topicId: string,
    buffer: Buffer,
  ): Promise<{ imported: number }> {
    await this.assertTopicExists(topicId);

    const rows = await readExcelRows(buffer, GRAMMAR_COLUMNS);

    const existing = await this.grammarsRepo.find({
      where: { topicId },
      select: { title: true, content: true },
    });
    const existingKeys = new Set(
      existing.map((item) => duplicateKey(item.title, item.content)),
    );
    const seenInFile = new Set<string>();

    const errors: ImportRowError[] = [];
    const validRows: typeof rows = [];
    for (const row of rows) {
      const before = errors.length;
      validateRow(row, GRAMMAR_COLUMNS, errors);
      if (errors.length > before) {
        continue;
      }

      const key = duplicateKey(row.values.title, row.values.content);
      if (existingKeys.has(key)) {
        errors.push({
          row: row.row,
          field: 'title',
          code: 'DUPLICATE_EXISTING',
        });
        continue;
      }
      if (seenInFile.has(key)) {
        errors.push({
          row: row.row,
          field: 'title',
          code: 'DUPLICATE_IN_FILE',
        });
        continue;
      }
      seenInFile.add(key);
      validRows.push(row);
    }
    throwIfInvalid(errors);

    const raw = await this.grammarsRepo
      .createQueryBuilder('grammar')
      .select('MAX(grammar.sortOrder)', 'max')
      .where('grammar.topicId = :topicId', { topicId })
      .getRawOne<{ max: string | number | null }>();
    const start =
      raw?.max === null || raw?.max === undefined ? 0 : Number(raw.max) + 1;

    const entities = validRows.map((row, index) =>
      this.grammarsRepo.create({
        title: row.values.title,
        content: row.values.content,
        sortOrder: start + index,
        topicId,
      }),
    );
    await this.grammarsRepo.manager.transaction((manager) =>
      manager.save(entities, { chunk: 100 }),
    );

    return { imported: entities.length };
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
