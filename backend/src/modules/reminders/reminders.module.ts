import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MailModule } from '../mail/mail.module';
import { LearnedVocabulary } from '../study/entities/learned-vocabulary.entity';
import { StudyDay } from '../study/entities/study-day.entity';
import { User } from '../users/entities/user.entity';
import { RemindersController } from './reminders.controller';
import { RemindersService } from './reminders.service';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    MailModule,
    TypeOrmModule.forFeature([User, StudyDay, LearnedVocabulary]),
  ],
  controllers: [RemindersController],
  providers: [RemindersService],
  exports: [RemindersService],
})
export class RemindersModule {}
