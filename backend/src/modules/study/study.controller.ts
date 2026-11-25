import {
  Body,
  Controller,
  Get,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ResponseMessage } from '../../decorator/customize';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { RolesGuard } from '../auth/guard/roles.guard';
import { AuthUser } from '../auth/strategy/jwt.strategy';
import { CompleteDailyReviewDto } from './dto/complete-daily-review.dto';
import { LearnedQueryDto } from './dto/learned-query.dto';
import { SetLearnedDto } from './dto/set-learned.dto';
import { StudyService } from './study.service';

// Learner progress: learned words, daily streak and the daily review.
@Controller('study')
@UseGuards(JwtAuthGuard, RolesGuard)
export class StudyController {
  constructor(private readonly studyService: StudyService) {}

  @Get('learned')
  @ResponseMessage('Get learned words successfully')
  findLearned(@Req() req: { user: AuthUser }, @Query() query: LearnedQueryDto) {
    return this.studyService.findLearned(req.user.id, query.topicId);
  }

  @Put('learned')
  @ResponseMessage('Update learned words successfully')
  setLearned(@Req() req: { user: AuthUser }, @Body() dto: SetLearnedDto) {
    return this.studyService.setLearned(req.user.id, dto);
  }

  @Get('streak')
  @ResponseMessage('Get study streak successfully')
  getStreak(@Req() req: { user: AuthUser }) {
    return this.studyService.getStreak(req.user.id);
  }

  @Get('daily-review')
  @ResponseMessage('Get daily review successfully')
  getDailyReview(@Req() req: { user: AuthUser }) {
    return this.studyService.getDailyReview(req.user.id);
  }

  @Post('daily-review/complete')
  @ResponseMessage('Complete daily review successfully')
  completeDailyReview(
    @Req() req: { user: AuthUser },
    @Body() dto: CompleteDailyReviewDto,
  ) {
    return this.studyService.completeDailyReview(req.user.id, dto);
  }
}
