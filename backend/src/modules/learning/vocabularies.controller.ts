import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ResponseMessage } from '../../decorator/customize';
import { Roles } from '../../decorator/roles.decorator';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { RolesGuard } from '../auth/guard/roles.guard';
import { UserRole } from '../users/entities/user.entity';
import { CreateVocabularyDto } from './dto/create-vocabulary.dto';
import { UpdateVocabularyDto } from './dto/update-vocabulary.dto';
import { VocabulariesService } from './vocabularies.service';

@Controller('vocabularies')
@UseGuards(JwtAuthGuard, RolesGuard)
export class VocabulariesController {
  constructor(private readonly vocabulariesService: VocabulariesService) {}

  @Get()
  @ResponseMessage('Get vocabularies successfully')
  findAllByTopic(@Query('topicId', ParseUUIDPipe) topicId: string) {
    return this.vocabulariesService.findAllByTopic(topicId);
  }

  @Get(':id')
  @ResponseMessage('Get vocabulary successfully')
  findOneWithExamples(@Param('id', ParseUUIDPipe) id: string) {
    return this.vocabulariesService.findOneWithExamples(id);
  }

  @Post()
  @Roles(UserRole.ADMIN)
  @ResponseMessage('Create vocabulary successfully')
  create(@Body() dto: CreateVocabularyDto) {
    return this.vocabulariesService.create(dto);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  @ResponseMessage('Update vocabulary successfully')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateVocabularyDto,
  ) {
    return this.vocabulariesService.update(id, dto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ResponseMessage('Delete vocabulary successfully')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.vocabulariesService.remove(id);
  }
}
