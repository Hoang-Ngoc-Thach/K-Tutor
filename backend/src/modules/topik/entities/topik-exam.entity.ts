import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { TopikAttempt } from './topik-attempt.entity';
import { TopikQuestion } from './topik-question.entity';

export enum TopikExamStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
}

// Values are the labels shown in the UI.
export const TOPIK_LEVELS = ['TOPIK I', 'TOPIK II'] as const;

@Entity('topik_exams')
export class TopikExam {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 150 })
  title: string;

  @Column({ type: 'varchar', length: 20 })
  level: string;

  @Column({ type: 'int' })
  year: number;

  @Column({ type: 'varchar', length: 50, nullable: true })
  round: string | null;

  @Column({ type: 'int' })
  durationMinutes: number;

  @Column({
    type: 'enum',
    enum: TopikExamStatus,
    default: TopikExamStatus.DRAFT,
  })
  status: TopikExamStatus;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @OneToMany(() => TopikQuestion, (question) => question.exam, {
    cascade: ['insert'],
  })
  questions: TopikQuestion[];

  @OneToMany(() => TopikAttempt, (attempt) => attempt.exam)
  attempts: TopikAttempt[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
