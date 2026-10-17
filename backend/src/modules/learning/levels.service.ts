import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateLevelDto } from './dto/create-level.dto';
import { UpdateLevelDto } from './dto/update-level.dto';
import { Level } from './entities/level.entity';

@Injectable()
export class LevelsService {
  constructor(
    @InjectRepository(Level)
    private readonly levelsRepo: Repository<Level>,
  ) {}

  findAll(): Promise<Level[]> {
    return this.levelsRepo.find({
      order: { sortOrder: 'ASC', createdAt: 'ASC' },
    });
  }

  async findOne(id: string): Promise<Level> {
    const level = await this.levelsRepo.findOne({ where: { id } });
    if (!level) {
      throw new NotFoundException('LEVEL_NOT_FOUND');
    }
    return level;
  }

  async create(dto: CreateLevelDto): Promise<Level> {
    await this.assertNameAvailable(dto.name);

    const level = this.levelsRepo.create({
      name: dto.name,
      description: dto.description ?? null,
      sortOrder: dto.sortOrder ?? 0,
    });
    return this.levelsRepo.save(level);
  }

  async update(id: string, dto: UpdateLevelDto): Promise<Level> {
    const level = await this.findOne(id);

    if (dto.name !== undefined) {
      await this.assertNameAvailable(dto.name, id);
      level.name = dto.name;
    }
    if (dto.description !== undefined) {
      level.description = dto.description;
    }
    if (dto.sortOrder !== undefined) {
      level.sortOrder = dto.sortOrder;
    }

    return this.levelsRepo.save(level);
  }

  // Xóa level sẽ xóa luôn các topic bên trong (onDelete: CASCADE)
  async remove(id: string): Promise<{ id: string }> {
    const level = await this.findOne(id);
    await this.levelsRepo.remove(level);
    return { id };
  }

  private async assertNameAvailable(
    name: string,
    ignoreId?: string,
  ): Promise<void> {
    const existing = await this.levelsRepo.findOne({ where: { name } });
    if (existing && existing.id !== ignoreId) {
      throw new ConflictException('LEVEL_NAME_EXISTS');
    }
  }
}