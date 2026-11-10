import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExampleSentence } from './entities/example-sentence.entity';
import { Grammar } from './entities/grammar.entity';
import { Level } from './entities/level.entity';
import { Topic } from './entities/topic.entity';
import { Vocabulary } from './entities/vocabulary.entity';
import { AdminContentsController } from './contents.controller';
import { ContentsService } from './contents.service';
import { GrammarsController } from './grammars.controller';
import { GrammarsService } from './grammars.service';
import { LevelsController } from './levels.controller';
import { LevelsService } from './levels.service';
import { TopicsController } from './topics.controller';
import { TopicsService } from './topics.service';
import { VocabulariesController } from './vocabularies.controller';
import { VocabulariesService } from './vocabularies.service';

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
  controllers: [
    LevelsController,
    TopicsController,
    VocabulariesController,
    GrammarsController,
    AdminContentsController,
  ],
  providers: [
    LevelsService,
    TopicsService,
    VocabulariesService,
    GrammarsService,
    ContentsService,
  ],
})
export class LearningModule {}
