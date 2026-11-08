import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ResponseMessage } from '../../decorator/customize';
import { Roles } from '../../decorator/roles.decorator';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { RolesGuard } from '../auth/guard/roles.guard';
import { UserRole } from '../users/entities/user.entity';
import { ContentsService } from './contents.service';
import { ListContentsQueryDto } from './dto/list-contents-query.dto';

@Controller('admin/contents')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AdminContentsController {
  constructor(private readonly contentsService: ContentsService) {}

  @Get()
  @Roles(UserRole.ADMIN)
  @ResponseMessage('Get contents successfully')
  findAll(@Query() query: ListContentsQueryDto) {
    return this.contentsService.findPage(query);
  }
}
