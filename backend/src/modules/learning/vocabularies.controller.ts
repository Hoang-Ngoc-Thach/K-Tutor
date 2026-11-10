import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ResponseMessage } from '../../decorator/customize';
import { Roles } from '../../decorator/roles.decorator';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { RolesGuard } from '../auth/guard/roles.guard';
import { UserRole } from '../users/entities/user.entity';
import { CreateVocabularyDto } from './dto/create-vocabulary.dto';
import { ImportContentDto } from './dto/import-content.dto';
import { UpdateVocabularyDto } from './dto/update-vocabulary.dto';
import { excelUploadOptions } from './excel/excel-import.util';
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

  // Thêm hàng loạt từ file Excel (.xlsx) vào một chủ đề.
  @Post('import')
  @Roles(UserRole.ADMIN)
  @UseInterceptors(FileInterceptor('file', excelUploadOptions))
  @ResponseMessage('Import vocabularies successfully')
  importFromExcel(
    @UploadedFile() file: Express.Multer.File | undefined,
    @Body() dto: ImportContentDto,
  ) {
    if (!file) {
      throw new BadRequestException('IMPORT_FILE_REQUIRED');
    }
    return this.vocabulariesService.importFromExcel(dto.topicId, file.buffer);
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
