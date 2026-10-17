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
import { CreateTopicDto } from './dto/create-topic.dto';
import { UpdateTopicDto } from './dto/update-topic.dto';
import { TopicsService } from './topics.service';

@Controller('topics')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TopicsController {
  constructor(private readonly topicsService: TopicsService) {}

  @Get()
  @ResponseMessage('Get topics successfully')
  findAll(@Query('levelId', ParseUUIDPipe) levelId: string) {
    return this.topicsService.findAll(levelId);
  }

  @Get(':id')
  @ResponseMessage('Get topic successfully')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.topicsService.findOne(id);
  }

  @Post()
  @Roles(UserRole.ADMIN)
  @ResponseMessage('Create topic successfully')
  create(@Body() dto: CreateTopicDto) {
    return this.topicsService.create(dto);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  @ResponseMessage('Update topic successfully')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateTopicDto) {
    return this.topicsService.update(id, dto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ResponseMessage('Delete topic successfully')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.topicsService.remove(id);
  }
}
