import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ResponseMessage } from '../../decorator/customize';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { RolesGuard } from '../auth/guard/roles.guard';
import { AuthUser } from '../auth/strategy/jwt.strategy';
import { SubmitTopikAttemptDto } from './dto/submit-topik-attempt.dto';
import { TopikAttemptsService } from './topik-attempts.service';
import { TopikExamsService } from './topik-exams.service';

// Learner side: published exams only.
@Controller('topik-exams')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TopikExamsController {
  constructor(
    private readonly examsService: TopikExamsService,
    private readonly attemptsService: TopikAttemptsService,
  ) {}

  @Get()
  @ResponseMessage('Get published TOPIK exams successfully')
  findAll() {
    return this.examsService.findPublished();
  }

  // Declared before ':id' so "attempts" is not parsed as an exam id.
  @Get('attempts/me')
  @ResponseMessage('Get my TOPIK attempts successfully')
  findMyAttempts(@Req() req: { user: AuthUser }) {
    return this.attemptsService.findMine(req.user.id);
  }

  @Get(':id')
  @ResponseMessage('Get TOPIK exam successfully')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.examsService.findPublishedForLearner(id);
  }

  @Post(':id/submit')
  @ResponseMessage('Submit TOPIK attempt successfully')
  submit(
    @Req() req: { user: AuthUser },
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: SubmitTopikAttemptDto,
  ) {
    return this.attemptsService.submit(req.user.id, id, dto);
  }
}
