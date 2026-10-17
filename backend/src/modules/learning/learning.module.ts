import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExampleSentence } from './entities/example-sentence.entity';
import { Grammar } from './entities/grammar.entity';
import { Level } from './entities/level.entity';
import { Topic } from './entities/topic.entity';
import { Vocabulary } from './entities/vocabulary.entity';
import { LevelsController } from './levels.controller';
import { LevelsService } from './levels.service';
import { TopicsController } from './topics.controller';
import { TopicsService } from './topics.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Level,
      Topic,
      Vocabulary,
      Grammar,
      ExampleSentence,
    ]),
  ],
  controllers: [LevelsController, TopicsController],
  providers: [LevelsService, TopicsService],
})
export class LearningModule {}
