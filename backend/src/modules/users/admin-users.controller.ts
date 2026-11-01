import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ResponseMessage } from '../../decorator/customize';
import { Roles } from '../../decorator/roles.decorator';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { RolesGuard } from '../auth/guard/roles.guard';
import { ListUsersQueryDto } from './dto/list-users-query.dto';
import { LockUserDto } from './dto/lock-user.dto';
import { UserRole } from './entities/user.entity';
import { UsersService } from './users.service';

@Controller('admin/users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AdminUsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Roles(UserRole.ADMIN)
  @ResponseMessage('Get users successfully')
  findAll(@Query() query: ListUsersQueryDto) {
    return this.usersService.findPage(query);
  }

  @Patch(':id/lock')
  @Roles(UserRole.ADMIN)
  @ResponseMessage('Update user lock status successfully')
  setLocked(@Param('id', ParseUUIDPipe) id: string, @Body() dto: LockUserDto) {
    return this.usersService.setLocked(id, dto.locked);
  }
}
