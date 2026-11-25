import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

// One row per learner per calendar day on which a daily review was finished.
// The streak is computed from these rows.
@Entity('study_days')
@Unique(['userId', 'date'])
export class StudyDay {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 36 })
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  // Calendar day in the study timezone, formatted YYYY-MM-DD.
  @Column({ type: 'varchar', length: 10 })
  date: string;

  @Column({ type: 'int', default: 0 })
  sessions: number;

  @Column({ type: 'int', default: 0 })
  wordsReviewed: number;

  @Column({ type: 'int', default: 0 })
  correctCount: number;

  @CreateDateColumn()
  createdAt: Date;
}
