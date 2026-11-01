import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExampleSentence } from '../learning/entities/example-sentence.entity';
import { Grammar } from '../learning/entities/grammar.entity';
import { Level } from '../learning/entities/level.entity';
import { Topic } from '../learning/entities/topic.entity';
import { Vocabulary } from '../learning/entities/vocabulary.entity';
import { User } from '../users/entities/user.entity';
import { AdminStatsController } from './admin-stats.controller';
import { AdminStatsService } from './admin-stats.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Level,
      Topic,
      Vocabulary,
      Grammar,
      ExampleSentence,
    ]),
  ],
  controllers: [AdminStatsController],
  providers: [AdminStatsService],
})
export class AdminModule {}
