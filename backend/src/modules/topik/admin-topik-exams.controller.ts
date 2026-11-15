import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ResponseMessage } from '../../decorator/customize';
import { Roles } from '../../decorator/roles.decorator';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { RolesGuard } from '../auth/guard/roles.guard';
import { UserRole } from '../users/entities/user.entity';
import { CreateTopikExamDto } from './dto/create-topik-exam.dto';
import { UpdateTopikExamDto } from './dto/update-topik-exam.dto';
import { TopikExamsService } from './topik-exams.service';

// Admin CRUD: returns drafts too, and includes the correct answers.
@Controller('admin/topik-exams')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminTopikExamsController {
  constructor(private readonly examsService: TopikExamsService) {}

  @Get()
  @ResponseMessage('Get TOPIK exams successfully')
  findAll() {
    return this.examsService.findAllForAdmin();
  }

  @Get(':id')
  @ResponseMessage('Get TOPIK exam successfully')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.examsService.findOneForAdmin(id);
  }

  @Post()
  @ResponseMessage('Create TOPIK exam successfully')
  create(@Body() dto: CreateTopikExamDto) {
    return this.examsService.create(dto);
  }

  @Patch(':id')
  @ResponseMessage('Update TOPIK exam successfully')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateTopikExamDto,
  ) {
    return this.examsService.update(id, dto);
  }

  @Delete(':id')
  @ResponseMessage('Delete TOPIK exam successfully')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.examsService.remove(id);
  }
}
