import {
  Body,
  Controller,
  Delete,
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
import { CreateGrammarDto } from './dto/create-grammar.dto';
import { UpdateGrammarDto } from './dto/update-grammar.dto';
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
