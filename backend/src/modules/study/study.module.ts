import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Vocabulary } from '../learning/entities/vocabulary.entity';
import { LearnedVocabulary } from './entities/learned-vocabulary.entity';
import { StudyDay } from './entities/study-day.entity';
import { StudyController } from './study.controller';
import { StudyService } from './study.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([LearnedVocabulary, StudyDay, Vocabulary]),
  ],
  controllers: [StudyController],
  providers: [StudyService],
})
export class StudyModule {}
