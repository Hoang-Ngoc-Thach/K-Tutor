import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { TopikExam } from './topik-exam.entity';

// One submitted attempt of a learner. Only the summary is stored.
@Entity('topik_attempts')
export class TopikAttempt {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'int' })
  score: number;

  @Column({ type: 'int' })
  correct: number;

  @Column({ type: 'int' })
  total: number;

  @Column({ type: 'int' })
  durationSec: number;

  @Column({ type: 'varchar', length: 36 })
  examId: string;

  @ManyToOne(() => TopikExam, (exam) => exam.attempts, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'examId' })
  exam: TopikExam;

  @Column({ type: 'varchar', length: 36 })
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @CreateDateColumn()
  createdAt: Date;
}
