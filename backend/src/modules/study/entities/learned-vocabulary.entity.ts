import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { Vocabulary } from '../../learning/entities/vocabulary.entity';
import { User } from '../../users/entities/user.entity';

// A word the learner has marked as learned ("Đã nhớ"). Only these words are
// used by the daily streak review.
@Entity('learned_vocabularies')
@Unique(['userId', 'vocabularyId'])
export class LearnedVocabulary {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 36 })
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'varchar', length: 36 })
  vocabularyId: string;

  @ManyToOne(() => Vocabulary, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'vocabularyId' })
  vocabulary: Vocabulary;

  @Column({ type: 'int', default: 0 })
  correctCount: number;

  @Column({ type: 'int', default: 0 })
  wrongCount: number;

  @Column({ type: 'datetime', nullable: true })
  lastReviewedAt: Date | null;

  @CreateDateColumn()
  learnedAt: Date;
}
