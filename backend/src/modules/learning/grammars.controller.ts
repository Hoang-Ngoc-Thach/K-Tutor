import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
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
import { CreateGrammarDto } from './dto/create-grammar.dto';
import { ImportContentDto } from './dto/import-content.dto';
import { UpdateGrammarDto } from './dto/update-grammar.dto';
import { excelUploadOptions } from './excel/excel-import.util';
import { GrammarsService } from './grammars.service';

@Controller('grammars')
@UseGuards(JwtAuthGuard, RolesGuard)
export class GrammarsController {
  constructor(private readonly grammarsService: GrammarsService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  @ResponseMessage('Create grammar successfully')
  create(@Body() dto: CreateGrammarDto) {
    return this.grammarsService.create(dto);
  }

  // Thêm hàng loạt từ file Excel (.xlsx) vào một chủ đề.
  @Post('import')
  @Roles(UserRole.ADMIN)
  @UseInterceptors(FileInterceptor('file', excelUploadOptions))
  @ResponseMessage('Import grammars successfully')
  importFromExcel(
    @UploadedFile() file: Express.Multer.File | undefined,
    @Body() dto: ImportContentDto,
  ) {
    if (!file) {
      throw new BadRequestException('IMPORT_FILE_REQUIRED');
    }
    return this.grammarsService.importFromExcel(dto.topicId, file.buffer);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  @ResponseMessage('Update grammar successfully')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateGrammarDto,
  ) {
    return this.grammarsService.update(id, dto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ResponseMessage('Delete grammar successfully')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.grammarsService.remove(id);
  }
}
