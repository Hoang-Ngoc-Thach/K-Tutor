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
import { CreateLevelDto } from './dto/create-level.dto';
import { UpdateLevelDto } from './dto/update-level.dto';
import { LevelsService } from './levels.service';

@Controller('levels')
@UseGuards(JwtAuthGuard, RolesGuard)
export class LevelsController {
  constructor(private readonly levelsService: LevelsService) {}

  @Get()
  @ResponseMessage('Get levels successfully')
  findAll() {
    return this.levelsService.findAll();
  }

  @Get(':id')
  @ResponseMessage('Get level successfully')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.levelsService.findOne(id);
  }

  @Post()
  @Roles(UserRole.ADMIN)
  @ResponseMessage('Create level successfully')
  create(@Body() dto: CreateLevelDto) {
    return this.levelsService.create(dto);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  @ResponseMessage('Update level successfully')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateLevelDto,
  ) {
    return this.levelsService.update(id, dto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ResponseMessage('Delete level successfully')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.levelsService.remove(id);
  }
}