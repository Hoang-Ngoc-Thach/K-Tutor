import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminTopikExamsController } from './admin-topik-exams.controller';
import { TopikAttempt } from './entities/topik-attempt.entity';
import { TopikExam } from './entities/topik-exam.entity';
import { TopikQuestion } from './entities/topik-question.entity';
import { TopikAttemptsService } from './topik-attempts.service';
import { TopikExamsController } from './topik-exams.controller';
import { TopikExamsService } from './topik-exams.service';

@Module({
  imports: [TypeOrmModule.forFeature([TopikExam, TopikQuestion, TopikAttempt])],
  controllers: [AdminTopikExamsController, TopikExamsController],
  providers: [TopikExamsService, TopikAttemptsService],
})
export class TopikModule {}
